import { Hono } from 'hono';
import { z } from 'zod';
import { UserService } from '../services/user.service';
import { zValidator } from '@hono/zod-validator';

export const userRouter = new Hono();

const UserLoginBody = z.object({
    password: z.string().min(1, "Password is required"),
});

const CreateUserBody = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
});

userRouter.put('/:username', zValidator('param', z.object({ username: z.string().min(1) })), zValidator('json', UserLoginBody), async (c) => {
    const { username } = c.req.valid('param');
    const body = c.req.valid('json');
    const userService = new UserService(c.get('db'), c.env);

    try {
        const { user, access_token } = await userService.login(username, body);
        c.header('authorization', `Bearer ${access_token}`);
        return c.json(user);
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'User not exist') {
                return c.json({ error: error.message }, 404);
            }
            if (error.message === 'Invalid password') {
                return c.json({ error: error.message }, 401);
            }
        }
        return c.json({ error: 'An unknown error occurred' }, 500);
    }
});

userRouter.post('/', zValidator('json', CreateUserBody), async (c) => {
    const body = c.req.valid('json');
    const userService = new UserService(c.get('db'), c.env);

    const newUser = await userService.createUser(body);
    return c.json(newUser, 201);
});
