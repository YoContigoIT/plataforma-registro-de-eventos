import { buildWhereClause, calculatePaginationInfo } from "@/shared/lib/utils";
import type { PaginatedResponse } from "@/shared/types";
import type { PrismaClient, RegistrationStatus } from "@prisma/client";
import type { UpdateRegistrationDto } from "~/domain/dtos/registration.dto";
import type { RegistrationWithRelations } from "~/domain/entities/registration.entity";
import type {
  IRegistrationRepository,
  RegistrationFilters,
} from "~/domain/repositories/registration.repository";

export const PrismaRegistrationRepository = (
  prisma: PrismaClient,
): IRegistrationRepository => {
  return {
    findMany: async (
      params: { page: number; limit: number },
      filters?: RegistrationFilters,
    ): Promise<PaginatedResponse<RegistrationWithRelations>> => {
      const { page, limit } = params;
      const offset = (page - 1) * limit;

      const where = buildWhereClause(filters?.search, {
        searchFields: [
          { field: "user.name" },
          { field: "user.email" },
          { field: "event.name" },
          { field: "qrCode" },
        ],
        exactFilters: {
          ...(filters?.userId && { userId: filters.userId }),
          ...(filters?.eventId && { eventId: filters.eventId }),
          ...(filters?.status && { status: filters.status }),
        },
        customFilters: {
          // Multiple statuses filter
          ...(filters?.statuses && {
            status: { in: filters.statuses },
          }),

          // Date range filters
          ...(filters?.invitedAt && {
            invitedAt: {
              ...(filters.invitedAt.from && { gte: filters.invitedAt.from }),
              ...(filters.invitedAt.to && { lte: filters.invitedAt.to }),
            },
          }),
          ...(filters?.respondedAt && {
            respondedAt: {
              ...(filters.respondedAt.from && {
                gte: filters.respondedAt.from,
              }),
              ...(filters.respondedAt.to && { lte: filters.respondedAt.to }),
            },
          }),
          ...(filters?.registeredAt && {
            registeredAt: {
              ...(filters.registeredAt.from && {
                gte: filters.registeredAt.from,
              }),
              ...(filters.registeredAt.to && { lte: filters.registeredAt.to }),
            },
          }),
          ...(filters?.checkedInAt && {
            checkedInAt: {
              ...(filters.checkedInAt.from && {
                gte: filters.checkedInAt.from,
              }),
              ...(filters.checkedInAt.to && { lte: filters.checkedInAt.to }),
            },
          }),

          // Event date filters
          ...(filters?.eventStartDate && {
            event: {
              start_date: {
                ...(filters.eventStartDate.from && {
                  gte: filters.eventStartDate.from,
                }),
                ...(filters.eventStartDate.to && {
                  lte: filters.eventStartDate.to,
                }),
              },
            },
          }),
          ...(filters?.eventEndDate && {
            event: {
              end_date: {
                ...(filters.eventEndDate.from && {
                  gte: filters.eventEndDate.from,
                }),
                ...(filters.eventEndDate.to && {
                  lte: filters.eventEndDate.to,
                }),
              },
            },
          }),

          // Boolean filters
          ...(filters?.hasResponded !== undefined && {
            respondedAt: filters.hasResponded ? { not: null } : null,
          }),
          ...(filters?.isCheckedIn !== undefined && {
            checkedInAt: filters.isCheckedIn ? { not: null } : null,
          }),
          ...(filters?.hasInviteToken !== undefined && {
            inviteToken: filters.hasInviteToken ? { not: null } : null,
          }),

          // Status convenience filters
          ...(filters?.isPending && { status: "PENDING" }),
          ...(filters?.isRegistered && { status: "REGISTERED" }),
          ...(filters?.isWaitlisted && { status: "WAITLISTED" }),
          ...(filters?.isCancelled && { status: "CANCELLED" }),
          ...(filters?.isDeclined && { status: "DECLINED" }),

          // Event-related filters
          ...(filters?.eventStatus && {
            event: { status: filters.eventStatus },
          }),
          ...(filters?.eventOrganizerId && {
            event: { organizerId: filters.eventOrganizerId },
          }),

          // Time-based event filters
          ...(filters?.isUpcomingEvent && {
            event: {
              start_date: { gte: new Date() },
            },
          }),
          ...(filters?.isPastEvent && {
            event: {
              end_date: { lt: new Date() },
            },
          }),
          ...(filters?.isActiveEvent && {
            event: {
              AND: [
                { start_date: { lte: new Date() } },
                { end_date: { gte: new Date() } },
              ],
            },
          }),

          // Response time filters
          ...(filters?.respondedWithin && {
            AND: [
              { respondedAt: { not: null } },
              {
                respondedAt: {
                  gte: filters.respondedWithin.days
                    ? new Date(
                        Date.now() -
                          filters.respondedWithin.days * 24 * 60 * 60 * 1000,
                      )
                    : filters.respondedWithin.hours
                      ? new Date(
                          Date.now() -
                            filters.respondedWithin.hours * 60 * 60 * 1000,
                        )
                      : new Date(),
                },
              },
            ],
          }),

          // Invite management filters
          ...(filters?.pendingInvites && {
            AND: [{ status: "PENDING" }, { inviteToken: { not: null } }],
          }),
          ...(filters?.expiredInvites && {
            AND: [
              { status: "PENDING" },
              {
                invitedAt: {
                  lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
                },
              },
            ],
          }),
        },
      });

      const [registrations, total] = await Promise.all([
        prisma.registration.findMany({
          where,
          skip: offset,
          take: limit,
          orderBy: { invitedAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                company: true,
                title: true,
                role: true,
              },
            },
            event: {
              select: {
                id: true,
                name: true,
                start_date: true,
                end_date: true,
                location: true,
                status: true,
                capacity: true,
                organizer: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        }),
        prisma.registration.count({ where }),
      ]);

      const pagination = calculatePaginationInfo(page, limit, total);
      return {
        data: registrations,
        pagination,
      };
    },
    findOne: async (id: string) => {
      return await prisma.registration.findUnique({
        where: {
          id,
        },
      });
    },
    findByUserId: async (userId: string) => {
      return await prisma.registration.findMany({
        where: {
          userId,
        },
      });
    },
    findByEventId: async (eventId: string) => {
      return await prisma.registration.findMany({
        where: {
          eventId,
        },
      });
    },
    update: async (data: UpdateRegistrationDto) => {
      return await prisma.registration.update({
        where: {
          id: data.id,
        },
        data,
      });
    },
    delete: async (id: string) => {
      await prisma.registration.delete({
        where: {
          id,
        },
      });
    },
    create: async (data) => {
      return await prisma.registration.create({
        data,
      });
    },
    countRegistrations: async ({
      userId,
      eventId,
    }: {
      userId?: string;
      eventId?: string;
    }) => {
      return await prisma.registration.count({
        where: {
          ...(userId && { userId }),
          ...(eventId && { eventId }),
        },
      });
    },
    countByStatus: async (eventId, status) => {
      return await prisma.registration.count({
        where: {
          eventId,
          status,
        },
      });
    },
    countAllStatusesByEvent: async (eventId: string) => {
      const statusCounts = await prisma.registration.groupBy({
        by: ["status"],
        where: {
          eventId,
        },
        _count: {
          status: true,
        },
      });

      return statusCounts.reduce(
        (acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        },
        {} as Record<RegistrationStatus, number>,
      );
    },
  };
};
