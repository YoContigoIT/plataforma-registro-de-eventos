import { redirect } from "react-router";
import { getSession } from "~/infrastructure/auth/session.service";
import type { Route } from "../../routes/+types/login";



export const sessionLoader = async ({ request }: Route.LoaderArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user");

  if (user) {
    return redirect("/panel");
  }
};