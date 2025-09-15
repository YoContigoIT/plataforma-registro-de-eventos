import * as jose from "jose";
import { JWT_CONFIG } from "../config/jwt";
import type { IJWTRepository } from "~/domain/repositories/jwt.repository";

const secretAccessToken = new TextEncoder().encode(process.env.JWT_SECRET!);
const secretRefreshToken = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET!);

export const JWTRepository = (): IJWTRepository => {
  const generateAccessToken = async (payload: jose.JWTPayload): Promise<string> => {
    return await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(JWT_CONFIG.accessTokenExpiration)
      .setIssuedAt()
      .sign(secretAccessToken);
  };

  const generateRefreshToken = async (payload: jose.JWTPayload): Promise<string> => {
    return await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(JWT_CONFIG.refreshTokenExpiration)
      .setIssuedAt()
      .sign(secretRefreshToken);
  };

  const verifyAccessToken = async (token: string): Promise<jose.JWTPayload> => {
    const { payload } = await jose.jwtVerify(token, secretAccessToken);
    return payload;
  };

  const verifyRefreshToken = async (token: string): Promise<jose.JWTPayload> => {
    const { payload } = await jose.jwtVerify(token, secretRefreshToken);
    return payload;
  };

  return {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
  };
};
