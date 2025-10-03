import type { EventStatus } from "@prisma/client";
import type { EventFilters } from "~/domain/repositories/event.repository";
import type { Route } from "../../routes/+types/events";

export const eventsLoader = async ({
  request,
  context: { repositories },
}: Route.LoaderArgs) => {
  const url = new URL(request.url);

  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "10", 10);
  const filters: EventFilters = {};

  // Status filter
  const status = url.searchParams.get("status");
  if (status && status !== "todos") {
    filters.status = status as EventStatus;
  }

  // Location filter
  const location = url.searchParams.get("location");
  if (location) {
    filters.location = location;
  }

  // Organizer filter
  const organizerId = url.searchParams.get("organizerId");
  if (organizerId) {
    filters.organizerId = organizerId;
  }

  // Search filter
  const search = url.searchParams.get("eventSearch");
  if (search) {
    filters.search = search;
  }

  // Date range filters
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");

  if (startDate) {
    filters.startDate =  startDate ? new Date(startDate) : undefined
  }

  if (endDate) {
    filters.endDate = endDate ? new Date(endDate) : undefined
  }

  // Boolean filters
  const isUpcoming = url.searchParams.get("isUpcoming");
  if (isUpcoming === "true") {
    filters.isUpcoming = true;
  }

  const hasAvailableSpots = url.searchParams.get("hasAvailableSpots");
  if (hasAvailableSpots === "true") {
    filters.hasAvailableSpots = true;
  }

  const isActive = url.searchParams.get("isActive");
  if (isActive === "true") {
    filters.isActive = true;
  }

  const archived = url.searchParams.get("archived");
  if (archived === "true") {
    filters.archived = true;
  }

  // Fetch events with pagination and filters
  const { data, pagination } = await repositories.eventRepository.findMany(
    { page, limit },
    filters,
  );

  return {
    events: data,
    pagination,
  };
};
