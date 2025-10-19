import { Hono } from 'hono';
import { bearerAuth } from 'hono/bearer-auth';
import { jwt } from 'hono/jwt';
import { outboundRouter } from "./apis/outbound";
import { userRouter } from "./apis/user";
import { ruleSetRouter } from "./apis/rule-set";
import { profileRouter } from "./apis/profile";
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './db/schema';

const app = new Hono();

app.use('*', async (c, next) => {
  const start = Date.now();
  await next();
  const end = Date.now();
  c.res.headers.set('X-Response-Time', `${end - start}`);
});

app.use('/api/*', async (c, next) => {
  const d1 = c.env.DB;
  const db = drizzle(d1, { schema });
  c.set('db', db);
  await next();
});

app.use('/api/*', async (c, next) => {
  if (c.req.path === '/api/users' && c.req.method === 'POST') {
    return await next();
  }
  if (c.req.path.startsWith('/api/users/') && c.req.method === 'PUT') {
    return await next();
  }

  const auth = jwt({ secret: c.env.JWT_SECRET });
  return auth(c, next);
});

app.route('/api/outbounds', outboundRouter);
app.route('/api/users', userRouter);
app.route('/api/rule-sets', ruleSetRouter);
app.route('/api/profiles', profileRouter);

export default app;
