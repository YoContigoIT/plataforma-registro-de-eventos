import type { Session } from "@prisma/client";

export interface SessionFilters {
  userId: string;
}

export interface ISessionRepository {
  findMany(filters: SessionFilters): Promise<Session[]>;
  findUnique(id: string): Promise<Session | null>;
  create(
    userId: string,
    deviceInfo?: {
      ipAddress: string;
      userAgent: string;
      fingerprint?: string;
    },
  ): Promise<{ session: Session; accessToken: string; refreshToken: string }>;
  renewTokens(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }>;
  revoke(id: string): Promise<Session>;
  revokeAll(id: string): Promise<void>;
}
