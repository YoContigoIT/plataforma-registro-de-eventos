import type { RegistrationStatus } from "@prisma/client";
import type { RegistrationFilters } from "~/domain/repositories/registration.repository";
import type { Route } from "../routes/+types/registrations";

export const registrationsLoader = async ({
  request,
  context: { repositories },
}: Route.LoaderArgs) => {
  const url = new URL(request.url);

  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "10", 10);
  const filters: RegistrationFilters = {};

  // i need to check a better way to extract this filters
  // Basic filters
  const userId = url.searchParams.get("userId");
  if (userId) {
    filters.userId = userId;
  }

  const eventId = url.searchParams.get("eventId");
  if (eventId) {
    filters.eventId = eventId;
  }

  // Status filter (single)
  const status = url.searchParams.get("status");
  if (status) {
    filters.status = status as RegistrationStatus;
  }

  // Multiple statuses filter
  const statuses = url.searchParams.get("statuses");
  if (statuses) {
    filters.statuses = statuses.split(",") as RegistrationStatus[];
  }

  // Search filter (searches across user name, email, event name, QR code)
  const search = url.searchParams.get("search");
  if (search) {
    filters.search = search;
  }

  // Date range filters
  const invitedAtFrom = url.searchParams.get("invitedAtFrom");
  const invitedAtTo = url.searchParams.get("invitedAtTo");
  if (invitedAtFrom || invitedAtTo) {
    filters.invitedAt = {
      from: invitedAtFrom ? new Date(invitedAtFrom) : undefined,
      to: invitedAtTo ? new Date(invitedAtTo) : undefined,
    };
  }

  const respondedAtFrom = url.searchParams.get("respondedAtFrom");
  const respondedAtTo = url.searchParams.get("respondedAtTo");
  if (respondedAtFrom || respondedAtTo) {
    filters.respondedAt = {
      from: respondedAtFrom ? new Date(respondedAtFrom) : undefined,
      to: respondedAtTo ? new Date(respondedAtTo) : undefined,
    };
  }

  const registeredAtFrom = url.searchParams.get("registeredAtFrom");
  const registeredAtTo = url.searchParams.get("registeredAtTo");
  if (registeredAtFrom || registeredAtTo) {
    filters.registeredAt = {
      from: registeredAtFrom ? new Date(registeredAtFrom) : undefined,
      to: registeredAtTo ? new Date(registeredAtTo) : undefined,
    };
  }

  const eventStartDateFrom = url.searchParams.get("eventStartDateFrom");
  const eventStartDateTo = url.searchParams.get("eventStartDateTo");
  if (eventStartDateFrom || eventStartDateTo) {
    filters.eventStartDate = {
      from: eventStartDateFrom ? new Date(eventStartDateFrom) : undefined,
      to: eventStartDateTo ? new Date(eventStartDateTo) : undefined,
    };
  }

  const eventEndDateFrom = url.searchParams.get("eventEndDateFrom");
  const eventEndDateTo = url.searchParams.get("eventEndDateTo");
  if (eventEndDateFrom || eventEndDateTo) {
    filters.eventEndDate = {
      from: eventEndDateFrom ? new Date(eventEndDateFrom) : undefined,
      to: eventEndDateTo ? new Date(eventEndDateTo) : undefined,
    };
  }

  // Boolean convenience filters
  const hasResponded = url.searchParams.get("hasResponded");
  if (hasResponded !== null) {
    filters.hasResponded = hasResponded === "true";
  }

  const isCheckedIn = url.searchParams.get("isCheckedIn");
  if (isCheckedIn !== null) {
    filters.isCheckedIn = isCheckedIn === "true";
  }

  const hasInviteToken = url.searchParams.get("hasInviteToken");
  if (hasInviteToken !== null) {
    filters.hasInviteToken = hasInviteToken === "true";
  }

  // Status convenience filters
  const isPending = url.searchParams.get("isPending");
  if (isPending === "true") {
    filters.isPending = true;
  }

  const isRegistered = url.searchParams.get("isRegistered");
  if (isRegistered === "true") {
    filters.isRegistered = true;
  }

  const isWaitlisted = url.searchParams.get("isWaitlisted");
  if (isWaitlisted === "true") {
    filters.isWaitlisted = true;
  }

  const isCancelled = url.searchParams.get("isCancelled");
  if (isCancelled === "true") {
    filters.isCancelled = true;
  }

  const isDeclined = url.searchParams.get("isDeclined");
  if (isDeclined === "true") {
    filters.isDeclined = true;
  }

  // Event-related filters
  const eventStatus = url.searchParams.get("eventStatus");
  if (eventStatus) {
    filters.eventStatus = eventStatus;
  }

  const eventOrganizerId = url.searchParams.get("eventOrganizerId");
  if (eventOrganizerId) {
    filters.eventOrganizerId = eventOrganizerId;
  }

  const isUpcomingEvent = url.searchParams.get("isUpcomingEvent");
  if (isUpcomingEvent === "true") {
    filters.isUpcomingEvent = true;
  }

  const isPastEvent = url.searchParams.get("isPastEvent");
  if (isPastEvent === "true") {
    filters.isPastEvent = true;
  }

  const isActiveEvent = url.searchParams.get("isActiveEvent");
  if (isActiveEvent === "true") {
    filters.isActiveEvent = true;
  }

  // Response time analysis
  const respondedWithinHours = url.searchParams.get("respondedWithinHours");
  const respondedWithinDays = url.searchParams.get("respondedWithinDays");
  if (respondedWithinHours || respondedWithinDays) {
    filters.respondedWithin = {
      hours: respondedWithinHours ? parseInt(respondedWithinHours, 10) : undefined,
      days: respondedWithinDays ? parseInt(respondedWithinDays, 10) : undefined,
    };
  }

  // Invite management filters
  const pendingInvites = url.searchParams.get("pendingInvites");
  if (pendingInvites === "true") {
    filters.pendingInvites = true;
  }

  const expiredInvites = url.searchParams.get("expiredInvites");
  if (expiredInvites === "true") {
    filters.expiredInvites = true;
  }

  // Fetch registrations with pagination and filters
  const { data, pagination } = await repositories.registrationRepository.findMany(
    { page, limit },
    filters,
  );

  return {
    registrations: data,
    pagination,
  };
};
