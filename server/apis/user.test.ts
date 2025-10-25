import { test, expect, vi, beforeEach } from 'vitest';
import { userRouter } from './user';
import { Hono } from 'hono';

vi.mock('hono/jwt', () => ({
  sign: vi.fn().mockResolvedValue('test-token'),
}));

let app: Hono;

beforeEach(() => {
  app = new Hono();
});

test('should return a token on successful login', async () => {
  const db = {
    select: () => ({
      from: () => ({
        where: () => ({
          get: () => ({
            id: 'test-id',
            username: 'testuser',
            password: '5f4dcc3b5aa765d61d8327deb882cf99', // md5('password')
          }),
        }),
      }),
    }),
  };

  app.use('*', (c, next) => {
    c.set('db', db);
    c.env = { JWT_SECRET: 'test-secret' };
    return next();
  });
  app.route('/users', userRouter);


  const res = await app.request('/users/testuser', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'password' }),
  });

  expect(res.status).toBe(200);
  expect(res.headers.get('Authorization')).toBe('Bearer test-token');
});

test('should return 401 on failed login', async () => {
  const db = {
    select: () => ({
      from: () => ({
        where: () => ({
          get: () => null,
        }),
      }),
    }),
  };

  app.use('*', (c, next) => {
    c.set('db', db);
    return next();
  });
  app.route('/users', userRouter);

  const res = await app.request('/users/testuser', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'wrong-password' }),
  });

  expect(res.status).toBe(401);
  const json = await res.json();
  expect(json.message).toBe('Invalid username or password');
});
