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
          archived: filters?.archived === true,
        },
        customFilters: {
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

          ...(filters?.startDate && {
            start_date: { gte: new Date(filters.startDate) },
          }),
          ...(filters?.endDate && {
            end_date: { lte: new Date(filters.endDate) },
          }),

          /*  //Date range filter (alternative approach - kept in case we add fine-tuned filters)
          ...(filters?.dateRange?.startDate && {
            start_date: { gte: filters.dateRange.startDate },
          }),
          ...(filters?.dateRange?.endDate && {
            end_date: { lte: filters.dateRange.endDate },
          }), */

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

          ...(filters?.hasAvailableSpots && {
            remainingCapacity: {
              gt: 0,
            },
          }),

          ...(filters?.isUpcoming && {
            start_date: { gte: new Date() },
          }),

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
