import type { DrizzleD1Database } from "drizzle-orm/d1";
import { drizzle } from "drizzle-orm/d1";
import { z } from "zod";
import jwt from 'jsonwebtoken';


export const JWTPayload = z.object({
    iss: z.string(),
    sub: z.string(),
    iat: z.number(),
    exp: z.number(),
    roles: z.array(z.string())
})

interface RouteHandler<
  PathParamsT extends Record<string, any> = Record<string, any>,
  QueryParamsT extends Record<string, any> = Record<string, any>,
  BodyT = any
> {
  ({
    request, 
    env,
    path_params,
    query_params,
    body,
    db,
    token_payload
  }: {
    request: Request,
    env: Env, 
    path_params: PathParamsT,
    query_params: QueryParamsT,
    body: BodyT,
    db: DrizzleD1Database,
    token_payload?: z.infer<typeof JWTPayload>
  }): Response | Promise<Response>;
}

interface RouteConfig<
  PathParamsT extends z.ZodObject = z.ZodObject,
  QueryParamsT extends z.ZodObject = z.ZodObject,
  BodyT extends z.ZodType = z.ZodObject
> {
  bodySchema?: BodyT;
  pathParamsSchema?: PathParamsT;
  queryParamsSchema?: QueryParamsT;
  allowedRoles?: string[];
}

interface Route {
  method: string;
  pattern: string;
  handler: RouteHandler;
  config: RouteConfig;
  regex: RegExp;
  paramNames: string[];
}

export class Router {
  private routes: Route[] = [];
  private pathPrefix: string = '';

  constructor(pathPrefix: string = '') {
    this.pathPrefix = pathPrefix.replace(/\/$/, ''); // Remove trailing slash
  }

  // Set or update the path prefix
  setPathPrefix(prefix: string): void {
    this.pathPrefix = prefix.replace(/\/$/, ''); // Remove trailing slash
  }

  // Add a route with method, URL pattern, handler, and optional config
  add<
    PathParamsT extends z.ZodObject = z.ZodObject,
    QueryParamsT extends z.ZodObject = z.ZodObject,
    BodyT extends z.ZodType = z.ZodObject
  >(
    method: string, pattern: string, 
    handler: RouteHandler<z.infer<PathParamsT>, z.infer<QueryParamsT>, z.infer<BodyT>>, 
    config: RouteConfig<PathParamsT, QueryParamsT, BodyT> = {}
  ): void {
    // Apply path prefix to the pattern
    const fullPattern = this.pathPrefix + pattern;
    
    const paramNames: string[] = [];
    
    // Convert URL pattern to regex, extracting parameter names
    const regexPattern = fullPattern.replace(/:([^/]+)/g, (match, paramName) => {
      paramNames.push(paramName);
      return '([^/]+)';
    });
    
    const regex = new RegExp(`^${regexPattern}$`);
    
    this.routes.push({
      method: method.toUpperCase(),
      pattern: fullPattern,
      handler,
      config,
      regex,
      paramNames
    });
  }

  // Merge routes from another router
  merge(otherRouter: Router): void {    
    for (const route of otherRouter.routes) {
      // Apply merge prefix to the existing route pattern
      const mergedPattern = this.pathPrefix + route.pattern;
      
      // Create new param names array and regex for the merged pattern
      const paramNames: string[] = [];
      const regexPattern = mergedPattern.replace(/:([^/]+)/g, (match, paramName) => {
        paramNames.push(paramName);
        return '([^/]+)';
      });
      
      const regex = new RegExp(`^${regexPattern}$`);
      
      this.routes.push({
        method: route.method,
        pattern: mergedPattern,
        handler: route.handler,
        config: route.config,
        regex,
        paramNames
      });
    }
  }

  // Handle incoming request
  async handle(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();
    const pathname = url.pathname;

    // Find matching route
    for (const route of this.routes) {
      if (route.method === method) {
        const match = pathname.match(route.regex);
        if (match) {
          try {
            // Extract parameters from URL
            const path_params_raw: Record<string, any> = {};
            for (let i = 0; i < route.paramNames.length; i++) {
              path_params_raw[route.paramNames[i]] = match[i + 1];
            }
            const path_params = route.config.pathParamsSchema?.parse(path_params_raw) || path_params_raw;
            
            // Parse query parameters
            const query_params = route.config.queryParamsSchema?.parse(
              Object.fromEntries(url.searchParams.entries())
            ) || {};
            
            // Parse request body
            const body = route.config.bodySchema?.parse(await request.json());
            
            // Verify JWT token if authorization header is present
            const authorization = request.headers.get('authorization');
            const access_token = authorization?.split(' ')[1];
            let token_payload: z.infer<typeof JWTPayload> | undefined;
            token_payload = JWTPayload.parse(jwt.verify(access_token || '', env.JWT_SECRET));
            
            // Check role-based access control
            if (route.config.allowedRoles && route.config.allowedRoles.length > 0) {
              if (!token_payload) {
                return new Response('Unauthorized: No token provided', { status: 401 });
              }
              
              const { roles: user_roles } = token_payload;

              if (!user_roles.includes('admin')) {
                const has_permission = route.config.allowedRoles.some(
                  role => user_roles.includes(role)
                );
                
                if (!has_permission) {
                  return new Response('Forbidden: Insufficient permissions', { status: 403 });
                }
              }
            }
            
            // Get drizzle database instance to D1 database
            const db = drizzle(env.DB);
            
            // Call the handler
            return await route.handler({
              request, path_params, query_params, 
              body, db, env, token_payload
            });
          } catch (error) {
            return new Response(
              `Bad Request: ${error instanceof Error ? error.message : 'Unknown error'}`, 
              { status: 400 }
            );
          }
        }
      }
    }

    // No route matched - return 404
    return new Response('Not Found', { status: 404 });
  }
}

// Example usage:
// router.get('/users/:id', ({path_params}) => {
//   return new Response(`User ID: ${path_params.id}`);
// });
// router.post('/users', async ({body, db}) => {
//   const users = await db.insert(Users).values(body).returning();
//   return new Response.json(users[0], { status: 201 });
// }, {
//   bodySchema: z.object({ name: z.string(), email: z.string().email() }),
//   allowedRoles: ['admin', 'user']
// });


export const api_router = new Router('/api');
// Register routes to this router.
