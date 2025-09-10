import type { Event, Registration, User } from "@prisma/client";

// Tipo para un usuario con sus relaciones incluidas
export type UserEntity = User & {
  registrations?: Registration[];
  createdEvents?: Event[];
};
// Tipo para información de paginación
export type PaginationInfo = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
};

// Tipo para el retorno del loader
export type UsersLoaderData = {
  data: Promise<{
    users: UserEntity[];
    pagination: PaginationInfo;
  }>;
};
