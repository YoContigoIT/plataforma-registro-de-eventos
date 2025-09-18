import { EventStatus } from "@prisma/client";
import type { Route } from "../routes/+types/panel";

export const dashboardLoader = async ({
  context: { repositories, session },
}: Route.LoaderArgs) => {
  const userRole = session.get("user")?.role;
  // Last 30 days filter
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const dateFilter = { from: thirtyDaysAgo };

  // Get event statistics for last 30 days
  const eventStats =
    await repositories.eventRepository.countAllStatuses(dateFilter);

  // Get ongoing events
  const ongoingEvents =
    await repositories.eventRepository.findByStatusAndDateRange(
      EventStatus.ONGOING,
      undefined,
      5
    );

  // Get upcoming events in next 30 days
  const upcomingEvents = await repositories.eventRepository.findUpcomingEvents(
    30,
    [EventStatus.UPCOMING, EventStatus.DRAFT],
    10
  );

  return {
    eventStats: {
      draft: eventStats.DRAFT || 0,
      published: eventStats.UPCOMING || 0,
      ongoing: eventStats.ONGOING || 0,
      cancelled: eventStats.CANCELLED || 0,
    },
    ongoingEvents,
    upcomingEvents,
    userRole,
  };
};
