/**
 * Helper functions for creating HTTP exceptions using Hono's HTTPException
 * 
 * @example
 * ```ts
 * import { forbidden, unauthorized, notFound } from './exceptions';
 * 
 * throw forbidden('You do not have permission to access this resource');
 * throw unauthorized('Please login first');
 * throw notFound('User not found');
 * ```
 */

import { HTTPException } from 'hono/http-exception';

/**
 * 400 Bad Request
 */
export const badRequest = (message = 'Bad Request') => 
  new HTTPException(400, { message });

/**
 * 401 Unauthorized
 */
export const unauthorized = (message = 'Unauthorized') => 
  new HTTPException(401, { message });

/**
 * 403 Forbidden
 */
export const forbidden = (message = 'Forbidden') => 
  new HTTPException(403, { message });

/**
 * 404 Not Found
 */
export const notFound = (message = 'Not Found') => 
  new HTTPException(404, { message });

/**
 * 409 Conflict
 */
export const conflict = (message = 'Conflict') => 
  new HTTPException(409, { message });

/**
 * 422 Unprocessable Entity
 */
export const unprocessableEntity = (message = 'Unprocessable Entity') => 
  new HTTPException(422, { message });

/**
 * 500 Internal Server Error
 */
export const internalServerError = (message = 'Internal Server Error') => 
  new HTTPException(500, { message });

// Re-export HTTPException for direct use
export { HTTPException } from 'hono/http-exception';
