import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { sign } from 'hono/jwt';
import * as CryptoJS from 'crypto-js';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

const userRouter = new Hono();

const PasswordSchema = z.object({
  password: z.string(),
});

userRouter.put('/:username', zValidator('json', PasswordSchema), async (c) => {
  const { username } = c.req.param();
  const { password } = c.req.valid('json');
  const db = c.get('db');

  const user = await db.select().from(users).where(eq(users.username, username)).get();

  if (!user) {
    return c.json({ message: 'Invalid username or password' }, 401);
  }

  const hashedPassword = CryptoJS.MD5(password).toString();
  if (user.password !== hashedPassword) {
    return c.json({ message: 'Invalid username or password' }, 401);
  }

  const payload = {
    iss: 'a-cup',
    sub: user.id,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
  };

  const token = await sign(payload, c.env.JWT_SECRET);

  c.header('Authorization', `Bearer ${token}`);
  return c.body(null, 200);
});

userRouter.get('/', async (c) => {
  const db = c.get('db');
  const allUsers = await db.select({
    id: users.id,
    username: users.username,
  }).from(users);
  return c.json(allUsers);
});

export { userRouter };
