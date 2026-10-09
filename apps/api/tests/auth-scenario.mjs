import { equal, ok } from 'node:assert/strict';
import { randomUUID, randomBytes } from 'node:crypto';
import { request as httpRequest } from 'node:http';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { DatabaseService } from '../dist/database/database.service.js';
import { RUNTIME_CONFIG } from '../dist/configuration/runtime-config.js';

// Shared real HTTP/Better Auth/PostgreSQL scenario; delivery is replaceable.
export async function runAuthScenario(app, delivery) {
  const email = `auth-check-${randomUUID()}@example.test`;
  // Real unique loopback peers isolate persistent rate-limit buckets without
  // disabling production protections or trusting a user-provided header.
  const bytes = randomBytes(2);
  let localAddress = `127.77.${bytes[0]}.${bytes[1] || 1}`;
  const peerAddresses = [localAddress];
  const database = app.get(DatabaseService).pool;
  const origin = app.get(RUNTIME_CONFIG).webOrigin;
  try {
    await app.listen(0, '127.0.0.1');
    const url = await app.getUrl();
    async function request(path, body, cookie) {
      return new Promise((resolve, reject) => {
        const outgoing = httpRequest(`${url}/api/${path}`, {
          method: body ? 'POST' : 'GET', localAddress,
          headers: { Origin: origin, ...(body ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { Cookie: cookie } : {}) },
        }, incoming => {
          const chunks = [];
          incoming.on('data', chunk => chunks.push(chunk));
          incoming.on('error', reject);
          incoming.on('end', () => {
            const headers = new Headers();
            for (let index = 0; index < incoming.rawHeaders.length; index += 2) headers.append(incoming.rawHeaders[index], incoming.rawHeaders[index + 1]);
            resolve(new Response(Buffer.concat(chunks), { status: incoming.statusCode, headers }));
          });
        });
        outgoing.on('error', reject);
        outgoing.setTimeout(10000, () => outgoing.destroy(new Error('Auth smoke request timed out')));
        outgoing.end(body ? JSON.stringify(body) : undefined);
      });
    }
    equal((await request('me')).status, 401);
    const sent = await request('auth/email-otp/send-verification-otp', { email, type: 'sign-in' });
    equal(sent.status, 200, await sent.text());
    async function readCode() {
      const otp = (await delivery.readText(email)).match(/code is (\d{6})/)?.[1];
      ok(otp, 'Code not found in isolated test email');
      return otp;
    }
    const otp = await readCode();
    const wrong = await request('auth/sign-in/email-otp', { email, otp: otp === '000000' ? '111111' : '000000' });
    equal(wrong.status, 400);
    equal((await wrong.json()).code, 'INVALID_OTP');
    const login = await request('auth/sign-in/email-otp', { email, otp, name: 'Disposable auth check', role: 'admin' });
    equal(login.status, 200, await login.text());
    const cookie = login.headers.getSetCookie().map(value => value.split(';')[0]).join('; ');
    ok(cookie, 'Sign-in must issue session cookie');
    const me = await request('me', undefined, cookie);
    equal(me.status, 200);
    equal((await me.json()).user.role, 'candidate', 'Signup cannot grant staff role');
    const currentSession = await request('auth/get-session', undefined, cookie);
    equal(currentSession.status, 200);
    equal((await currentSession.json()).user.role, 'candidate');
    equal((await request('staff/access', undefined, cookie)).status, 403);
    const reused = await request('auth/sign-in/email-otp', { email, otp });
    equal(reused.status, 400);
    equal((await reused.json()).code, 'INVALID_OTP');
    execFileSync(process.execPath, [fileURLToPath(new URL('../dist/auth/provision-staff.js', import.meta.url)), email, 'recruiter', 'Disposable recruiter'], { stdio: 'pipe' });
    equal((await request('me', undefined, cookie)).status, 401, 'Provisioning revokes pre-existing sessions');
    // Candidate checks exhaust the sign-in path's three-request bucket. A new
    // socket peer tests the staff flow without disabling/resetting protections.
    localAddress = `127.78.${bytes[0]}.${bytes[1] || 1}`;
    peerAddresses.push(localAddress);
    equal((await request('auth/email-otp/send-verification-otp', { email, type: 'sign-in' })).status, 200);
    const staffLogin = await request('auth/sign-in/email-otp', { email, otp: await readCode() });
    equal(staffLogin.status, 200, await staffLogin.text());
    const staffCookie = staffLogin.headers.getSetCookie().map(value => value.split(';')[0]).join('; ');
    equal((await request('staff/access', undefined, staffCookie)).status, 200);
    const logout = await request('auth/sign-out', {}, staffCookie);
    equal(logout.status, 200);
    equal((await request('me', undefined, staffCookie)).status, 401);
    const unsupported = await request('auth/email-otp/send-verification-otp', { email, type: 'email-verification' });
    equal(unsupported.status, 400);
    equal((await unsupported.json()).code, 'UNSUPPORTED_OTP_TYPE');
    console.log(`PASS (${delivery.label}): real OTP/session flow, wrong/used-code rejection, safe signup role, transactional provisioning/session revocation, staff authorization, logout.`);
  } finally {
    try {
      await database.query('DELETE FROM "user" WHERE email = $1', [email]);
      for (const address of peerAddresses) await database.query('DELETE FROM "rateLimit" WHERE key LIKE $1', [`${address}%`]);
    } finally {
      try { await delivery.cleanup?.(); } finally { await app.close(); }
    }
  }
}
