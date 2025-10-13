import type { Route as RouteLogout } from ".react-router/types/app/presentation/auth/routes/+types/logout";
import { redirect } from "react-router";
import { destroySession } from "~/infrastructure/auth/session.service";

export const logoutAction = async ({
  context: { repositories, session },
}: RouteLogout.ActionArgs) => {
  const sessiondId = session.get("sessionId");

  if (!sessiondId) {
    return redirect("/iniciar-sesion", {
      headers: {
        "Set-Cookie": await destroySession(session),
      },
    });
  }

  await repositories.sessionRepository.revoke(sessiondId);

  return redirect("/iniciar-sesion", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
};