import { UserRole } from "@prisma/client";
import { redirect } from "react-router";
import {
  commitSession,
  destroySession,
} from "~/infrastructure/auth/session.service";
import type { Route } from "../../presentation/+types/layout";

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ["/iniciar-sesion", "/registro", "/", "/inicio"];

// Definition of routes protected by role
const ROLE_PROTECTED_ROUTES: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: [
    "/panel",
    "/usuarios",
    "/usuarios/crear",
    "/usuarios/:id",
    "/usuarios/:id/actualizar",
    "/eventos",
    "/eventos/crear",
    "/eventos/:id",
    "/eventos/:id/actualizar",
    "/perfil",
    "/perfil/actualizar",
    "/perfil/cambiar-contrasenia",
    "/perfil/cerrar-sesion",
  ],
  [UserRole.ORGANIZER]: [
    "/panel",
    "/eventos",
    "/eventos/crear",
    "/eventos/:id",
    "/eventos/:id/actualizar",
    "/perfil",
    "/perfil/actualizar",
    "/perfil/cambiar-contrasenia",
    "/perfil/cerrar-sesion",
  ],
  [UserRole.ATTENDEE]: [
    "/registro",
    "/registro/:id",
    "/mis-eventos",
    "/mis-eventos/:id",
    "/perfil",
    "/perfil/actualizar",
    "/perfil/cambiar-contrasenia",
    "/perfil/cerrar-sesion",
  ],
};

// Helper function to create regex for route matching
const createRouteRegex = (route: string): RegExp => {
  return new RegExp("^" + route.replace(/:[^/]+/g, "[^/]+") + "$");
};

// Function to check if user has access to a route
const hasRouteAccess = (userRole: UserRole, pathname: string): boolean => {
  // Admin has access to everything
  if (userRole === UserRole.ADMIN) {
    return true;
  }

  // Check if route is accessible based on user role
  const accessibleRoutes = [
    ...ROLE_PROTECTED_ROUTES[userRole],
    // Organizers also have access to admin routes
    ...(userRole === UserRole.ORGANIZER ? ROLE_PROTECTED_ROUTES[UserRole.ADMIN] : []),
  ];

  return accessibleRoutes.some(route => createRouteRegex(route).test(pathname));
};

// Helper function to handle session invalidation
const invalidateSession = async (session: any) => {
  return redirect("/iniciar-sesion", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
};

// Helper to validate device fingerprint
const validateDeviceFingerprint = (stored: string, current: string): boolean => {
  if (!stored || !current) return true;
  
  const getBasicBrowserInfo = (ua: string) => {
    const lowerUA = ua.toLowerCase();
    const browser = lowerUA.includes("chrome")
      ? "chrome"
      : lowerUA.includes("firefox")
        ? "firefox"
        : lowerUA.includes("safari")
          ? "safari"
          : lowerUA.includes("edge")
            ? "edge"
            : "unknown";
    const os = lowerUA.includes("windows")
      ? "windows"
      : lowerUA.includes("mac")
        ? "mac"
        : lowerUA.includes("linux")
          ? "linux"
          : lowerUA.includes("android")
            ? "android"
            : lowerUA.includes("ios")
              ? "ios"
              : "unknown";
    return { browser, os };
  };

  const storedInfo = getBasicBrowserInfo(stored);
  const currentInfo = getBasicBrowserInfo(current);

  return storedInfo.browser === currentInfo.browser && storedInfo.os === currentInfo.os;
};

export const authMiddleware = async ({
  request,
  context: { repositories, session, clientInfo },
}: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Skip auth check for public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    return null;
  }
  
  const accessToken = session.get("accessToken");
  const refreshToken = session.get("refreshToken");
  const sessionId = session.get("sessionId");

  if (!accessToken || !sessionId) {
    return redirect("/iniciar-sesion");
  }

  const sessiondb = await repositories.sessionRepository.findUnique(sessionId);

  if (!sessiondb) {
    return invalidateSession(session);
  }

  // Validate device fingerprint if available
  if (sessiondb.device_fingerprint && clientInfo.userAgent && sessiondb.user_agent) {
    if (!validateDeviceFingerprint(sessiondb.user_agent, clientInfo.userAgent)) {
      console.warn(
        `Session revoked due to device change. Stored: ${sessiondb.user_agent}, Current: ${clientInfo.userAgent}`,
      );
      await repositories.sessionRepository.revoke(sessionId);
      return invalidateSession(session);
    }
  }

  try {
    const payload = await repositories.jwtRepository.verifyAccessToken(accessToken);
    const user = await repositories.userRepository.findUnique(payload.id as string);

    // Verify user exists
    if (!user) {
      return invalidateSession(session);
    }

    // Verify user has access to the route
    if (!hasRouteAccess(user.role, pathname)) {
      return redirect("/inicio");
    }

    return { user };
  } catch {
    try {
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const renewed = await repositories.sessionRepository.renewTokens(refreshToken);

      session.set("accessToken", renewed.accessToken);
      session.set("refreshToken", renewed.refreshToken);

      return redirect(request.url, {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    } catch {
      return invalidateSession(session);
    }
  }
};
