import { jwt } from 'hono/jwt';
import type { HonoEnv } from './types';
import type { Context, Next } from 'hono';

export const authMiddleware = async (c: Context<HonoEnv>, next: Next) => {
  const auth = jwt({ secret: c.env.JWT_SECRET });
  await auth(c, async () => {
    // Extract userId from JWT payload and set it in context
    const payload = c.get('jwtPayload');
    c.set('userId', payload.sub);
    await next();
  });
};