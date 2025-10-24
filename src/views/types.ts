export interface LoginCredentials {
  username: string
  password?: string
}

export interface LoginResponse {
  id: number
  username: string
  token: string
}

export interface User {
  id: number
  username: string
}

export interface JWTPayload {
  sub: string
  exp: number
}