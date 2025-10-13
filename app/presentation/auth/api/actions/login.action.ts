import type { Route as RouteLogin } from ".react-router/types/app/presentation/auth/routes/+types/login";
import { redirect } from "react-router";
import { loginSchema } from "~/domain/dtos/auth.dto";
import {
    commitSession,
    getSession
} from "~/infrastructure/auth/session.service";

export const loginAction = async ({
  request,
  context: { repositories, clientInfo },
}: RouteLogin.ActionArgs) => {
  const formData = Object.fromEntries(await request.formData());

  const { success, data, error } = loginSchema.safeParse(formData);

  if (!success) {
    return {
      errors: error.message,
    };
  }

  const user = await repositories.userRepository.findByEmail(data.email);

  if (!user || !user.password) {
    return {
      error: "Credenciales incorrectas",
    };
  }

  const isValid = await repositories.encryptorRepository.comparePassword(
    data.password,
    user.password,
  );

  if (!isValid) {
    return {
      error: "Credenciales incorrectas",
    };
  }

  const { accessToken, refreshToken, session } =
    await repositories.sessionRepository.create(user.id, {
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    });

  const sessionStore = await getSession(request.headers.get("Cookie"));

  sessionStore.set("user", user);
  sessionStore.set("accessToken", accessToken);
  sessionStore.set("refreshToken", refreshToken);
  sessionStore.set("sessionId", session.id);

  /* try {
    await services.emailService.sendLoginNotification(
      user.email,
      user.name,
      {
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        timestamp: new Date(),
      }
    );
    console.log(`Login notification email sent to: ${user.email}`);
  } catch (error) {
    // Don't fail the login if email fails, just log the error
    console.error("Failed to send login notification email:", error);
  } */

  return redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(sessionStore),
    },
  });
};