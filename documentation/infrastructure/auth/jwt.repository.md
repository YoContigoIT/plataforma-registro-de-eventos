# Documentación: Repositorio JWT

## Objetivo
Generar y verificar tokens JWT (access y refresh) utilizando `jose`, con expiraciones configurables y secretos de entorno.

## Estructura del Repositorio
- Implementa `IJWTRepository` (`~/domain/repositories/jwt.repository`).
- Expone:
  - `generateAccessToken(payload: jose.JWTPayload): Promise<string>`
  - `generateRefreshToken(payload: jose.JWTPayload): Promise<string>`
  - `verifyAccessToken(token: string): Promise<jose.JWTPayload>`
  - `verifyRefreshToken(token: string): Promise<jose.JWTPayload>`

## Implementación

```typescript:c%3A%5Cdev%5Cevent-manager%5Capp%5Cinfrastructure%5Cauth%5Cjwt.repository.ts
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
```

## Variables de entorno requeridas
- `JWT_SECRET`: secreto para firmar y verificar access tokens.
- `JWT_REFRESH_SECRET`: secreto para firmar y verificar refresh tokens.

## Funcionalidades principales
- Generación de tokens:
  - Access token y refresh token con `HS256` y expiraciones de `JWT_CONFIG`.
- Verificación de tokens:
  - Decodificación y validación de firma para ambos tipos.

## Flujos principales
1. Autenticación: generar access/refresh tokens tras validar credenciales.
2. Autorización de requests: verificar access token en middleware/guards.
3. Renovación: verificar refresh token para emitir nuevo access token.

## Consideraciones de uso
- Proteger secretos y rotarlos periódicamente.
- Definir expiraciones en `JWT_CONFIG` acorde a riesgos y UX.
- Incluir claims relevantes (ej. `sub`, `role`) en `payload` según el dominio.
- Manejar excepciones de verificación (expirado, inválido) con respuestas seguras.

## Ejemplo de uso

```typescript:c%3A%5Cdev%5Cevent-manager%5Cdocumentation%5Cexamples%2Fjwt-usage.example.ts
import { JWTRepository } from "@/infrastructure/auth/jwt.repository";

const jwtRepo = JWTRepository();

export async function issueTokens(userId: string) {
  const payload = { sub: userId };
  const accessToken = await jwtRepo.generateAccessToken(payload);
  const refreshToken = await jwtRepo.generateRefreshToken(payload);
  return { accessToken, refreshToken };
}

export async function validateToken(accessToken: string) {
  const payload = await jwtRepo.verifyAccessToken(accessToken);
  return payload;
}
```

## Ver también
- `app/infrastructure/config/jwt` (configuración de expiraciones)
- `documentation/auth/auth.md` (gestión de sesiones y tokens)