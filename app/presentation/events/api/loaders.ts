import type { EventStatus } from "@prisma/client";
import type { EventEntity } from "~/domain/entities/event.entity";
import type { EventFilters } from "~/domain/repositories/event.repository";
import type { LoaderData } from "~/shared/types";
import type { Route } from "../routes/+types/events";

export const eventsLoader = async ({
  request,
  context: { repositories },
}: Route.LoaderArgs) => {
  const url = new URL(request.url);

  // Extract pagination parameters
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "10", 10);

  // Extract filter parameters
  const filters: EventFilters = {};

  // Status filter
  const status = url.searchParams.get("status");
  if (status) {
    filters.status = status as EventStatus; // Cast to EventStatus enum
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

  // Date range filter
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");

  if (startDate || endDate) {
    filters.dateRange = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };
  }

  // Fetch events with pagination and filters
  const result = await repositories.eventRepository.findMany(
    { page, limit },
    filters,
  );

  return {
    events: result.data,
    pagination: result.pagination,
  };
};

export const getEventByIdLoader = async ({
  request,
  context: { repositories },
}: Route.LoaderArgs): Promise<LoaderData<EventEntity>> => {
  const url = new URL(request.url);
  const id = url.pathname.split("/").pop();

  if (!id) {
    return {
      success: false,
      error: "Event ID is required",
    };
  }

  const event = await repositories.eventRepository.findUnique(id);

  if (!event) {
    return {
      success: false,
      error: "Event not found",
    };
  }

  return {
    success: true,
    data: event,
  };
};
