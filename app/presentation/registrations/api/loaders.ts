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
  
  // Add sorting parameters
  const sortBy = url.searchParams.get("sortBy") || "invitedAt";
  const sortDirection = (url.searchParams.get("sortOrder") as "asc" | "desc") || "desc";
  
  const filters: RegistrationFilters = {};

  // Basic filters
  const userId = url.searchParams.get("userId");
  if (userId) {
    filters.userId = userId;
  }

  const eventId = url.searchParams.get("eventId");
  if (eventId) {
    filters.eventId = eventId;
  }

  const search = url.searchParams.get("search");
  if (search) {
    filters.search = search;
  }

  // Status filters
  const status = url.searchParams.get("status") as RegistrationStatus;
  if (status) {
    filters.status = status;
  }

  // Multiple statuses filter
  const statusesParam = url.searchParams.get("statuses");
  if (statusesParam) {
    filters.statuses = statusesParam.split(",") as RegistrationStatus[];
  }

  // Simple date filters (single date, not ranges)
  const invitedAt = url.searchParams.get("invitedAt");
  if (invitedAt) {
    filters.invitedAt = new Date(invitedAt);
  }

  const respondedAt = url.searchParams.get("respondedAt");
  if (respondedAt) {
    filters.respondedAt = new Date(respondedAt);
  }

  const registeredAt = url.searchParams.get("registeredAt");
  if (registeredAt) {
    filters.registeredAt = new Date(registeredAt);
  }

  const checkedInAt = url.searchParams.get("checkedInAt");
  if (checkedInAt) {
    filters.checkedInAt = new Date(checkedInAt);
  }

  // System date range filters
  const createdAtFrom = url.searchParams.get("createdAtFrom");
  const createdAtTo = url.searchParams.get("createdAtTo");
  if (createdAtFrom || createdAtTo) {
    filters.createdAt = {
      from: createdAtFrom ? new Date(createdAtFrom) : undefined,
      to: createdAtTo ? new Date(createdAtTo) : undefined,
    };
  }

  const updatedAtFrom = url.searchParams.get("updatedAtFrom");
  const updatedAtTo = url.searchParams.get("updatedAtTo");
  if (updatedAtFrom || updatedAtTo) {
    filters.updatedAt = {
      from: updatedAtFrom ? new Date(updatedAtFrom) : undefined,
      to: updatedAtTo ? new Date(updatedAtTo) : undefined,
    };
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

  // Boolean convenience filters
  const hasResponded = url.searchParams.get("hasResponded");
  if (hasResponded !== null) {
    filters.hasResponded = hasResponded === "true";
  }

  const isCheckedIn = url.searchParams.get("isCheckedIn");
  if (isCheckedIn !== null) {
    filters.isCheckedIn = isCheckedIn === "true";
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

  // Fetch registrations with pagination, filters, and sorting
  const { data, pagination } = await repositories.registrationRepository.findMany(
    { page, limit, sortBy, sortDirection },
    filters,
  );

  return {
    registrations: data,
    pagination,
  };
};
