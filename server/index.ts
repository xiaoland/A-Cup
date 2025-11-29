import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { sign } from "hono/jwt";
import * as CryptoJS from "crypto-js";
import { userRouter } from "./apis/user";
import { profileRouter } from "./apis/profile";
import { drizzle } from "drizzle-orm/d1";
import type { HonoEnv } from "./types";

const app = new Hono<HonoEnv>();

// Error handling middleware
app.use("*", async (c, next) => {
  try {
    await next();
  } catch (error) {
    console.error("Caught exception:", error);

    // Handle Hono HTTPException instances
    if (error instanceof HTTPException) {
      return c.json(
        {
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        error.status,
      );
    }

    // Handle other errors with status property
    const statusCode =
      error instanceof Error && "status" in error ? (error as any).status : 500;

    const message =
      error instanceof Error ? error.message : "Internal Server Error";

    return c.json(
      {
        error: message,
        details: error instanceof Error ? error.stack : String(error),
        timestamp: new Date().toISOString(),
      },
      statusCode,
    );
  }
});

// Response time logger
app.use("*", async (c, next) => {
  const start = Date.now();
  await next();
  const end = Date.now();
  c.res.headers.set("X-Response-Time", `${end - start}`);
});

const api = new Hono<HonoEnv>();

// DB middleware on the api router
api.use("*", async (c, next) => {
  const d1 = c.env.DB;
  const db = drizzle(d1);
  c.set("db", db);
  await next();
});

import { outboundApi } from "./apis/outbound";
import { ruleSetApi } from "./apis/ruleset";
import { wireguardKeypairApi } from "./apis/wireguard-keypair";

// Register module routers
api.route("/user", userRouter);
api.route("/profiles", profileRouter);
api.route("/outbounds", outboundApi);
api.route("/rulesets", ruleSetApi);
api.route("/shared/wg_keypairs", wireguardKeypairApi);

// Mount the api router under /api
app.route("/api", api);

export default app;
