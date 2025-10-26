import { Hono } from 'hono';
import { userRouter } from "./apis/user";
import { profileRouter } from "./apis/profile";
import { drizzle } from 'drizzle-orm/d1';

const app = new Hono();

// Error handling middleware
app.use('*', async (c, next) => {
  try {
    await next();
  } catch (error) {
    console.error('Caught exception:', error);
    
    const statusCode = error instanceof Error && 'status' in error 
      ? (error as any).status 
      : 500;
    
    const message = error instanceof Error 
      ? error.message 
      : 'Internal Server Error';
    
    return c.json({
      error: message,
      details: error instanceof Error ? error.stack : String(error),
      timestamp: new Date().toISOString()
    }, statusCode);
  }
});

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
