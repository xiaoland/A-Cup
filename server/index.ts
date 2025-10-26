import { Hono } from 'hono';
import { userRouter } from "./apis/user";
import { profileRouter } from "./apis/profile";
import { drizzle } from 'drizzle-orm/d1';

const app = new Hono();

// Response time logger
app.use('*', async (c, next) => {
  const start = Date.now();
  await next();
  const end = Date.now();
  c.res.headers.set('X-Response-Time', `${end - start}`);
});


const api = new Hono();

// DB middleware on the api router
api.use('*', async (c, next) => {
  const d1 = c.env.DB;
  const db = drizzle(d1);
  c.set('db', db);
  await next();
});

import { outboundApi } from './apis/outbound';

// Register module routers
api.route('/users', userRouter);
api.route('/profiles', profileRouter);
api.route('/outbounds', outboundApi);

// Mount the api router under /api
app.route('/api', api);

export default app;
