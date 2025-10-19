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

// DB middleware for all API routes
app.use('/api/*', async (c, next) => {
    const d1 = c.env.DB;
    const db = drizzle(d1, { schema });
    c.set('db', db);
    await next();
});

// --- Public Routes ---
// User login and signup are public.
app.route('/api/users', userRouter);


// --- JWT Middleware ---
// All routes defined after this middleware will be protected.
app.use('/api/*', jwt({ secret: c.env.JWT_SECRET }));


// --- Secured Routes ---
app.route('/api/outbounds', outboundRouter);
app.route('/api/rule-sets', ruleSetRouter);
app.route('/api/profiles', profileRouter);
app.route('/api/users', securedUserRouter); // For future secured user endpoints


export default app;
