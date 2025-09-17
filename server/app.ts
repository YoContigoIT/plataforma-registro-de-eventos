import {
  createDependenciesContainer,
  type IRepositoriesContainer,
  type IServicesContainer,
} from "@/infrastructure/config/dependencies";
import prisma from "@/infrastructure/db/prisma";
import { createRequestHandler } from "@react-router/express";
import express from "express";
import "react-router";
import type { Session } from "react-router";
import {
  getSession,
  type SessionData,
  type SessionFlashData,
} from "~/infrastructure/auth/session.service";

declare module "react-router" {
  interface AppLoadContext {
    repositories: IRepositoriesContainer;
    services: IServicesContainer;
    session: Session<SessionData, SessionFlashData>;
    clientInfo: {
      ipAddress: string;
      userAgent: string;
    };
  }
}

export const app = express();

// Función para obtener la IP real del cliente
function getClientIP(req: express.Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    (req.headers["x-real-ip"] as string) ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

app.use(
  createRequestHandler({
    build: () => import("virtual:react-router/server-build"),
    async getLoadContext(req: express.Request) {
      const { repositories, services } = createDependenciesContainer(prisma);
      const session = await getSession(req.headers.cookie);

      // Obtener información del cliente
      const clientInfo = {
        ipAddress: getClientIP(req),
        userAgent: req.headers["user-agent"] || "unknown",
      };

      return {
        repositories,
        services,
        session,
        clientInfo,
      };
    },
  }),
);
