import { Users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { api_router } from '../fund/router';
import jwt from 'jsonwebtoken';
import * as z from "zod";
import { hash } from 'crypto';


const UserLoginBody = z.object({
    password: z.string().min(1, "Password is required"),
})

api_router.add('put', '/users/:username', async ({
    path_params, body, db, env
}): Promise<Response> => {
    const { password: password_raw } = body;
    const password = hash("md5", password_raw).toString();

    const users = await db.select().from(Users).where(eq(Users.username, path_params.username))
    if (users.length === 0) {
        return Response.json({ error: "User not exist" }, { status: 404 });
    }
    if (users[0].password !== password) {
        return Response.json({ error: "Invalid password" }, { status: 401 });
    }
    else {
        const access_token = jwt.sign({
            "iss": "a-cup",
            "sub": users[0].id,
            "iat": Math.floor(Date.now() / 1000),
            "exp": Math.floor(Date.now() / 1000) + 60 * 60,
            "roles": users[0].roles
        }, env.JWT_SECRET);
        return Response.json(users[0], {
            headers: {
                'authorization': `Bearer ${access_token}`,
            }
        })
    }
}, {
    bodySchema: UserLoginBody,
    pathParamsSchema: z.object({
        username: z.string().min(1, "Username is required")
    })
});


const CreateUserBody = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
    roles: z.array(z.string()).default(["authenticated"])
});

api_router.add('post', '/users', async ({
    body, db
}): Promise<Response> => {
    const { username, password, roles } = body;
    const password_hashed = hash("md5", password).toString();
    
    const user = await db.insert(Users).values({
        username,
        password: password_hashed,
        roles
    }).returning();
    return Response.json(user[0], { status: 201 });
}, {
    bodySchema: CreateUserBody,
    allowedRoles: ['admin']
});
