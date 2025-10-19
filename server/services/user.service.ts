import { Users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { DrizzleD1Database } from 'drizzle-orm/d1';
import jwt from 'jsonwebtoken';
import * as z from "zod";
import { hash } from 'crypto';

const UserLoginBody = z.object({
    password: z.string().min(1, "Password is required"),
});

const CreateUserBody = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
});

export class UserService {
    constructor(private db: DrizzleD1Database, private env: any) {}

    async login(username: string, body: z.infer<typeof UserLoginBody>) {
        const { password: password_raw } = body;
        const password = hash("md5", password_raw).toString();

        const users = await this.db.select().from(Users).where(eq(Users.username, username));
        if (users.length === 0) {
            throw new Error("User not exist");
        }
        if (users[0].password !== password) {
            throw new Error("Invalid password");
        }
        else {
            const access_token = jwt.sign({
                "iss": "a-cup",
                "sub": users[0].id,
                "iat": Math.floor(Date.now() / 1000),
                "exp": Math.floor(Date.now() / 1000) + 60 * 60,
                "roles": ["authenticated"]
            }, this.env.JWT_SECRET);
            return {
                user: users[0],
                access_token
            };
        }
    }

    async createUser(body: z.infer<typeof CreateUserBody>) {
        const { username, password } = body;
        const password_hashed = hash("md5", password).toString();

        const user = await this.db.insert(Users).values({
            username,
            password: password_hashed,
        }).returning();
        return user[0];
    }
}
