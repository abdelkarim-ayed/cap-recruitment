import { ok } from 'node:assert/strict';
import { createApplication } from '../dist/bootstrap.js';
import { runAuthScenario } from './auth-scenario.mjs';

// Optional real SMTP/PostgreSQL/Mailpit integration, not part of pnpm test.
if ((process.env.MAIL_DRIVER ?? 'smtp') !== 'smtp') throw new Error('auth:check verifies SMTP; use MAIL_DRIVER=smtp or auth:mock-check.');
const messageIds = [];
await runAuthScenario(await createApplication(false), {
  label: 'SMTP/Mailpit',
  async readText(email) {
    const inbox = await (await fetch('http://127.0.0.1:58025/api/v1/messages', { signal: AbortSignal.timeout(5000) })).json();
    const message = inbox.messages.find(item => !messageIds.includes(item.ID) && item.To?.some(to => to.Address === email));
    ok(message, 'Captured OTP email was not found');
    messageIds.push(message.ID);
    const content = await (await fetch(`http://127.0.0.1:58025/api/v1/message/${message.ID}`, { signal: AbortSignal.timeout(5000) })).json();
    return content.Text;
  },
  async cleanup() {
    if (messageIds.length) await fetch('http://127.0.0.1:58025/api/v1/messages', {
      method: 'DELETE', signal: AbortSignal.timeout(5000), headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ IDs: messageIds }),
    });
  },
});
