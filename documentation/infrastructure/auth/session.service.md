# Documentación: Servicio de Sesión (Cookie Session Storage)

## Objetivo
Gestionar la sesión del usuario mediante cookies seguras, exponiendo utilidades para obtener, confirmar y destruir sesiones.

## Estructura del Servicio
- Define tipos:
  - `SessionData`: `accessToken`, `refreshToken`, `sessionId`, `user: User`.
  - `SessionFlashData`: `error`, `success`.
- Expone:
  - `getSession(cookieHeader?: string | null)`
  - `commitSession(session)`
  - `destroySession(session)`

## Implementación

```typescript:c%3A%5Cdev%5Cevent-manager%5Capp%5Cinfrastructure%5Cauth%5Csession.service.ts
import type { User } from "@prisma/client";
import { createCookieSessionStorage } from "react-router";

export type SessionData = {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  user: User;
};

export type SessionFlashData = {
  error: string;
  success: string;
};

export const { getSession, commitSession, destroySession } = createCookieSessionStorage<
  SessionData,
  SessionFlashData
>({
  cookie: {
    name: "auth_session",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET || "s3cret1"],
    secure: process.env.NODE_ENV === "production",
  },
});
```

## Variables de entorno requeridas
- `SESSION_SECRET`: secreto para firmar la cookie de sesión.
- `NODE_ENV`: activa `secure` en producción.

## Funcionalidades principales
- Creación y persistencia de sesión con cookie segura (HTTP-only, `sameSite: lax`, `secure` en producción).
- Manejo de datos y mensajes flash dentro de la sesión.
- Destrucción segura de sesión con invalidación de cookie.

## Flujos principales
1. Login: crear sesión con `accessToken`/`refreshToken` y datos del usuario; `commitSession`.
2. Request autenticada: leer sesión con `getSession` y validar tokens.
3. Logout: destruir sesión con `destroySession` y limpiar el estado cliente.

## Consideraciones de uso
- No almacenar información sensible innecesaria en la sesión.
- Ajustar `maxAge` conforme a políticas de seguridad y UX.
- Regenerar `sessionId` en eventos sensibles (ej. escalado de privilegios).
- Combinar con guards/middleware para proteger rutas y validar tokens.

## Ejemplo de uso

```typescript:c%3A%5Cdev%5Cevent-manager%5Cdocumentation%5Cexamples%2Fsession-usage.example.ts
import { getSession, commitSession, destroySession } from "@/infrastructure/auth/session.service";

export async function loginAction(request: Request, accessToken: string, refreshToken: string, user: any) {
  const cookieHeader = request.headers.get("Cookie");
  const session = await getSession(cookieHeader);
  session.set("accessToken", accessToken);
  session.set("refreshToken", refreshToken);
  session.set("user", user);

  return new Response("OK", {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}

export async function logoutAction(request: Request) {
  const cookieHeader = request.headers.get("Cookie");
  const session = await getSession(cookieHeader);

  return new Response(null, {
    status: 302,
    headers: { "Set-Cookie": await destroySession(session), Location: "/" },
  });
}
```

## Ver también
- `documentation/auth/auth.md` (gestión de sesiones y autenticación)
- `app/presentation/guards` (rutas y acciones relacionadas con registro y check-in)