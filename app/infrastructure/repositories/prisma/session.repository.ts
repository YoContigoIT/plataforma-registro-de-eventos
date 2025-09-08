import type { PrismaClient } from "@prisma/client";
import type { IJWTRepository } from "~/domain/repositories/jwt.repository";
import type { ISessionRepository } from "~/domain/repositories/session.repository";

export const PrismaSessionRepository = (
  prisma: PrismaClient,
  jwtRepository: IJWTRepository,
): ISessionRepository => ({
  findMany: async (filters) => {
    return await prisma.session.findMany({
      where: {
        user_id: filters.userId,
      },
      orderBy: {
        created_at: "desc",
      },
    });
  },
  findUnique: async (id) => {
    return await prisma.session.findUnique({
      where: {
        id,
      },
    });
  },
  create: async (userId, deviceInfo) => {
    const accessToken = await jwtRepository.generateAccessToken({
      id: userId,
      type: "access",
    });
    const refreshToken = await jwtRepository.generateRefreshToken({
      id: userId,
      type: "refresh",
    });

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const session = await prisma.session.create({
      data: {
        user_id: userId,
        refresh_token_hash: refreshToken,
        expires_at: expiresAt,
        device_fingerprint: deviceInfo?.fingerprint,
        ip_address: deviceInfo?.ipAddress,
        user_agent: deviceInfo?.userAgent,
      },
    });

    return { session, accessToken, refreshToken };
  },
  renewTokens: async (refreshToken) => {
    const payload = await jwtRepository.verifyRefreshToken(refreshToken);

    if (!payload || payload.type !== "refresh") {
      throw new Error("Invalid refresh token");
    }

    const session = await prisma.session.findUnique({
      where: { refresh_token_hash: refreshToken },
      include: { user: true },
    });

    if (!session) {
      throw new Error("Session not found");
    }

    const now = new Date();

    if (now > session.expires_at) {
      await prisma.session.delete({ where: { id: session.id } });
      throw new Error("Session expired - please authenticate again");
    }

    if (payload.id !== session.user_id) {
      throw new Error("Invalid token");
    }

    const newAccessToken = await jwtRepository.generateAccessToken({ id: session.user.id });
    const newRefreshToken = await jwtRepository.generateRefreshToken({
      id: session.user.id,
      type: "refresh",
    });

    await prisma.session.update({
      where: { id: session.id },
      data: {
        refresh_token_hash: newRefreshToken,
      },
      include: { user: true },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  },
  revoke: async (id) => {
    return await prisma.session.delete({
      where: {
        id,
      },
    });
  },
  revokeAll: async (id) => {
    await prisma.session.deleteMany({
      where: {
        id: {
          not: id,
        },
      },
    });
  },
});
