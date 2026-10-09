import { createApplication } from './bootstrap.js';

const app = await createApplication();
await app.listen(Number(process.env.PORT ?? 3000), process.env.API_HOST ?? '127.0.0.1');
