import { Hono } from 'hono';
import { jwt } from 'hono/jwt';
import { outboundRouter } from "./apis/outbound";
import { userRouter, securedUserRouter } from "./apis/user";
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

// DB middleware for all API routes
api.use('*', async (c, next) => {
    const d1 = c.env.DB;
    const db = drizzle(d1, { schema });
    c.set('db', db);
    await next();
});

// Secured routes
const secured = new Hono();
secured.use('*', jwt({ secret: c.env.JWT_SECRET }));
secured.route('/outbounds', outboundRouter);
secured.route('/rule-sets', ruleSetRouter);
secured.route('/profiles', profileRouter);
secured.route('/users', securedUserRouter);

// Public routes (user login/signup) are handled by userRouter
api.route('/users', userRouter);

// All other API routes are secured
api.route('/', secured);

// Mount the main api router under /api
app.route('/api', api);

export default app;
