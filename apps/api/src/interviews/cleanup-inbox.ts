import { Pool } from 'pg';
import { databaseUrl } from '../configuration/environment.js';

// Retention only. No extraction runner, business-state changes or reminders.
export async function cleanupReadNotifications(pool:Pick<Pool,'query'>) {
  const result=await pool.query("DELETE FROM inbox_notifications WHERE read_at < now()-interval '7 days'");
  return result.rowCount??0;
}
async function main() {
  const pool=new Pool({connectionString:databaseUrl(),connectionTimeoutMillis:3000});
  const run=async()=>{try{console.log(`Inbox retention: removed ${await cleanupReadNotifications(pool)} read notifications.`);}catch{console.error('Inbox retention failed; retry on the next run.');process.exitCode=1;}};
  await run();
  if(process.argv.includes('--watch')) {
    const timer=setInterval(()=>{void run();},24*60*60*1000);
    for(const signal of ['SIGINT','SIGTERM'] as const)process.once(signal,()=>{clearInterval(timer);void pool.end();});
  }else await pool.end();
}
if(process.argv[1]?.endsWith('/cleanup-inbox.js'))void main();
