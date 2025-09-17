import { buildWhereClause, calculatePaginationInfo } from "@/shared/lib/utils";
import type { PaginatedResponse } from "@/shared/types";
import { EventStatus, type PrismaClient } from "@prisma/client";
import type { EventEntity } from "~/domain/entities/event.entity";
import type { IEventRepository } from "~/domain/repositories/event.repository";

export function PrismaEventRepository(prisma: PrismaClient): IEventRepository {
  return {
    findMany: async (
      params,
      filters,
    ): Promise<PaginatedResponse<EventEntity>> => {
      const { page, limit } = params;
      const offset = (page - 1) * limit;

      const where = buildWhereClause(filters?.search, {
        searchFields: [
          { field: "name" },
          { field: "description" },
          { field: "location" },
        ],
        exactFilters: {
          ...(filters?.organizerId && { organizerId: filters.organizerId }),
          ...(filters?.status && { status: filters.status }),
          ...(filters?.location && { location: filters.location }),
          ...(filters?.archived !== undefined && {
            archived: filters.archived,
          }),
        },
        customFilters: {
          // Individual field searches (if not using general search)
          ...(filters?.name && {
            name: { contains: filters.name, mode: "insensitive" },
          }),
          ...(filters?.description && {
            description: { contains: filters.description, mode: "insensitive" },
          }),
          ...(filters?.agenda && {
            agenda: { contains: filters.agenda, mode: "insensitive" },
          }),

          // Capacity range filter
          ...(filters?.capacity && {
            capacity: {
              ...(filters.capacity.min !== undefined && {
                gte: filters.capacity.min,
              }),
              ...(filters.capacity.max !== undefined && {
                lte: filters.capacity.max,
              }),
            },
          }),

          // Max tickets range filter
          ...(filters?.maxTickets && {
            maxTickets: {
              ...(filters.maxTickets.min !== undefined && {
                gte: filters.maxTickets.min,
              }),
              ...(filters.maxTickets.max !== undefined && {
                lte: filters.maxTickets.max,
              }),
            },
          }),

          // Start date range filter
          ...(filters?.startDate && {
            start_date: {
              ...(filters.startDate.from && { gte: filters.startDate.from }),
              ...(filters.startDate.to && { lte: filters.startDate.to }),
            },
          }),

          // End date range filter
          ...(filters?.endDate && {
            end_date: {
              ...(filters.endDate.from && { gte: filters.endDate.from }),
              ...(filters.endDate.to && { lte: filters.endDate.to }),
            },
          }),

          // Date range filter (alternative approach)
          ...(filters?.dateRange?.startDate && {
            start_date: { gte: filters.dateRange.startDate },
          }),
          ...(filters?.dateRange?.endDate && {
            end_date: { lte: filters.dateRange.endDate },
          }),

          // System date filters
          ...(filters?.createdAt && {
            createdAt: {
              ...(filters.createdAt.from && { gte: filters.createdAt.from }),
              ...(filters.createdAt.to && { lte: filters.createdAt.to }),
            },
          }),
          ...(filters?.updatedAt && {
            updatedAt: {
              ...(filters.updatedAt.from && { gte: filters.updatedAt.from }),
              ...(filters.updatedAt.to && { lte: filters.updatedAt.to }),
            },
          }),

          // Available spots filter
          ...(filters?.hasAvailableSpots && {
            registrations: {
              _count: {
                lt: prisma.event.fields.capacity,
              },
            },
          }),

          // Upcoming events filter
          ...(filters?.isUpcoming && {
            start_date: { gte: new Date() },
          }),

          // Active events filter (currently happening)
          ...(filters?.isActive && {
            AND: [
              { start_date: { lte: new Date() } },
              { end_date: { gte: new Date() } },
              { status: { not: "CANCELLED" } },
              { archived: false },
            ],
          }),
        },
      });

      const [events, total] = await Promise.all([
        prisma.event.findMany({
          where,
          skip: offset,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            organizer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            registrations: {
              select: {
                id: true,
                status: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            _count: {
              select: {
                registrations: true,
              },
            },
          },
        }),
        prisma.event.count({ where }),
      ]);

      const pagination = calculatePaginationInfo(page, limit, total);

      return {
        data: events,
        pagination,
      };
    },

    findUnique: async (id) => {
      return await prisma.event.findUnique({
        where: { id },
      });
    },

    findByOrganizerId: async (organizerId) => {
      return await prisma.event.findMany({
        where: { organizerId },
        orderBy: { start_date: "desc" },
      });
    },

    create: async (data) => {
      return await prisma.event.create({
        data,
      });
    },

    update: async (data) => {
      return await prisma.event.update({
        where: { id: data.id },
        data,
      });
    },

    delete: async (id) => {
      await prisma.event.delete({
        where: { id },
      });
    },

    softDelete: async (id) => {
      await prisma.event.update({
        where: { id },
        data: {
          status: EventStatus.CANCELLED,
          archived: true,
        },
      });
    },

    countByStatus: async (status, dateFilter) => {
      return await prisma.event.count({
        where: {
          status,
          ...(dateFilter && {
            createdAt: {
              ...(dateFilter.from && { gte: dateFilter.from }),
              ...(dateFilter.to && { lte: dateFilter.to }),
            },
          }),
        },
      });
    },

    countAllStatuses: async (dateFilter) => {
      const statusCounts = await prisma.event.groupBy({
        by: ["status"],
        where: {
          ...(dateFilter && {
            createdAt: {
              ...(dateFilter.from && { gte: dateFilter.from }),
              ...(dateFilter.to && { lte: dateFilter.to }),
            },
          }),
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
        {} as Record<EventStatus, number>,
      );
    },

    findByStatusAndDateRange: async (status, dateRange, limit = 10) => {
      return await prisma.event.findMany({
        where: {
          status,
          ...(dateRange && {
            AND: [
              ...(dateRange.from
                ? [{ start_date: { gte: dateRange.from } }]
                : []),
              ...(dateRange.to ? [{ start_date: { lte: dateRange.to } }] : []),
            ],
          }),
        },
        orderBy: { start_date: "asc" },
        take: limit,
      });
    },

    findUpcomingEvents: async (
      daysAhead,
      statuses = ["UPCOMING", "DRAFT"],
      limit = 10,
    ) => {
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + daysAhead);

      return await prisma.event.findMany({
        where: {
          start_date: {
            gte: today,
            lte: futureDate,
          },
          status: {
            in: statuses,
          },
        },
        orderBy: { start_date: "asc" },
        take: limit,
      });
    },
  };
}
