import { readRuntimeConfig } from '../../configuration/runtime-config.js';
import { readCapturedMail } from './file-mail-sender.js';

const [email] = process.argv.slice(2);
const settings = readRuntimeConfig();
if (!email || settings.mail.driver !== 'file') throw new Error('Use MAIL_DRIVER=file pnpm mail:latest email for local captured mail.');
try {
  const captured = await readCapturedMail(settings.mail.outboxDirectory, email);
  console.log(`DEVELOPMENT CAPTURE ONLY — not sent. Captured at ${captured.createdAt}\n${captured.message.text}`);
} catch (error) {
  if ((error as NodeJS.ErrnoException).code === 'ENOENT') throw new Error('No locally captured mail for that address; request a code first.');
  throw error;
}
