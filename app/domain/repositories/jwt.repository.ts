import type * as jose from "jose";

export interface IJWTRepository {
  generateAccessToken: (payload: jose.JWTPayload) => Promise<string>;
  generateRefreshToken: (payload: jose.JWTPayload) => Promise<string>;
  verifyAccessToken: (token: string) => Promise<jose.JWTPayload>;
  verifyRefreshToken: (token: string) => Promise<jose.JWTPayload>;
}
