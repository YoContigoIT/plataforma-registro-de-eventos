import { buildWhereClause, calculatePaginationInfo } from "@/shared/lib/utils";
import type { PaginatedResponse } from "@/shared/types";
import { EventStatus, type Prisma, type PrismaClient } from "@prisma/client";
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

      const where = buildWhereClause(undefined, {
        searchFields: [
          { field: "name" },
          { field: "location" },
          { field: "description" },
        ],
        dateRangeFilter: filters?.dateRange
          ? {
              field: "start_date",
              startDate: filters.dateRange.startDate,
              endDate: filters.dateRange.endDate,
            }
          : undefined,
        exactFilters: {
          status: filters?.status,
          location: filters?.location,
          archived: filters?.archived ?? false,
        },
        customFilters: {
          organizerId: filters?.organizerId,
        },
      }) as Prisma.EventWhereInput;

      const [events, totalItems] = await Promise.all([
        prisma.event.findMany({
          skip: offset,
          take: limit,
          where,
          orderBy: {
            start_date: "desc",
          },
        }),
        prisma.event.count({ where }),
      ]);

      const pagination = calculatePaginationInfo(page, limit, totalItems);

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
  };
}
