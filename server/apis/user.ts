import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { sign } from 'hono/jwt';
import * as CryptoJS from 'crypto-js';
import type { HonoEnv } from '../types';

const userRouter = new Hono<HonoEnv>();

const LoginSchema = z.object({
  password: z.string(),
});

userRouter.post('/login', zValidator('json', LoginSchema), async (c) => {
  const { password } = c.req.valid('json');

  const hashedPassword = CryptoJS.MD5(password).toString();
  const adminPasswordHash = CryptoJS.MD5(c.env.ADMIN_PASSWORD).toString();

  if (hashedPassword !== adminPasswordHash) {
    return c.json({ message: 'Invalid password' }, 401);
  }

  const payload = {
    iss: 'a-cup',
    sub: 'admin', // Static subject for the admin user
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
  };

  const token = await sign(payload, c.env.JWT_SECRET);

  c.header('Authorization', `Bearer ${token}`);
  return c.json({ token });
});

export { userRouter };
