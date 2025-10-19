import { Hono } from 'hono';
import { jwt } from 'hono/jwt';
import { outboundRouter } from "./apis/outbound";
import { userRouter } from "./apis/user";
import { ruleSetRouter } from "./apis/rule-set";
import { profileRouter } from "./apis/profile";
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './db/schema';

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
  const db = drizzle(d1, { schema });
  c.set('db', db);
  await next();
});

// JWT middleware on the api router
api.use('*', async (c, next) => {
  if (c.req.path === '/users' && c.req.method === 'POST') {
    return await next();
  }
  if (c.req.path.startsWith('/users/') && c.req.method === 'PUT') {
    return await next();
  }

  const auth = jwt({ secret: c.env.JWT_SECRET });
  return auth(c, next);
});

// Register module routers
api.route('/outbounds', outboundRouter);
api.route('/users', userRouter);
api.route('/rule-sets', ruleSetRouter);
api.route('/profiles', profileRouter);

// Mount the api router under /api
app.route('/api', api);

export default app;
