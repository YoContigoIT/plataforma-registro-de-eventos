import type { Route } from "../routes/+types/verify-registration";

export const registrationByTokenLoader = async ({
  params,
  context,
}: Route.LoaderArgs) => {
  const token = params.token;
  if (!token) {
    return null;
  }
  const registration =
    await context.repositories.registrationRepository.findByToken(token);

  return { registration };
};
