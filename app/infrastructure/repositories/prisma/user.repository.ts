import { buildWhereClause, calculatePaginationInfo } from "@/shared/lib/utils";
import type { PaginatedResponse } from "@/shared/types";
import { UserRole, type Prisma, type PrismaClient } from "@prisma/client";
import type { UserEntity } from "~/domain/entities/user.entity";
import type { IUserRepository } from "~/domain/repositories/user.repository";

export const PrismaUserRepository = (
  prisma: PrismaClient
): IUserRepository => ({
  create: async (data) => {
    return await prisma.user.create({
      data,
    });
  },
  findMany: async (
    { page, limit },
    filters
  ): Promise<PaginatedResponse<UserEntity>> => {
    const offset = (page - 1) * limit;

    const excludedRoles = [UserRole.ADMIN, ...(filters?.excludeRoles ?? [])];

    const where = buildWhereClause(filters?.search, {
      searchFields: [{ field: "name" }],
      customFilters: {
        id: filters?.currentUserId ? { not: filters.currentUserId } : undefined,
        role: { notIn: excludedRoles },
        archived: false,
      },
    }) as Prisma.UserWhereInput;

    const [data, totalItems] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.user.count({ where }),
    ]);

    const pagination = calculatePaginationInfo(page, limit, totalItems);

    return {
      data,
      pagination,
    };
  },
  findUnique: async (id) => {
    return await prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        registrations: true,
        createdEvents: true,
      },
    });
  },
  findByEmail: async (email) => {
    return await prisma.user.findFirst({
      where: {
        email,
      },
    });
  },
  update: async (userId, data) => {
    return await prisma.user.update({
      where: { id: userId },
      data,
    });
  },
  updatePassword: async (userId, newPassword): Promise<void> => {
    await prisma.user.update({
      where: { id: userId },
      data: { password: newPassword },
    });
  },

  delete: async (id): Promise<void> => {
    await prisma.user.update({
      where: { id },
      data: { archived: true },
    });
  },
});
