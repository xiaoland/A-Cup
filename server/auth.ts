import { jwt } from 'hono/jwt';

export const authMiddleware = async (c, next) => {
  const auth = jwt({ secret: c.env.JWT_SECRET });
  await auth(c, async () => {
    // Extract userId from JWT payload and set it in context
    const payload = c.get('jwtPayload');
    c.set('userId', payload.sub);
    await next();
  });
};