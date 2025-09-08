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
