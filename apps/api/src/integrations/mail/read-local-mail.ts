import { readRuntimeConfig } from '../../configuration/runtime-config.js';
import { readCapturedMail } from './file-mail-sender.js';

const [email] = process.argv.slice(2);
const settings = readRuntimeConfig();
if (!email || settings.mail.driver !== 'file') throw new Error('Use MAIL_DRIVER=file pnpm mail:latest email for local captured mail.');
try {
  const captured = await readCapturedMail(settings.mail.outboxDirectory, email);
  if(captured.message.to.trim().toLowerCase()!==email.trim().toLowerCase())throw new Error('Captured recipient mismatch.');
  console.log(`DEVELOPMENT CAPTURE ONLY — not sent.\nTo: ${captured.message.to}\nSubject: ${captured.message.subject}\nCaptured at ${captured.createdAt}\n${captured.message.text}`);
} catch (error) {
  if ((error as NodeJS.ErrnoException).code === 'ENOENT') throw new Error('No locally captured mail for that address; request a code first.');
  throw error;
}
