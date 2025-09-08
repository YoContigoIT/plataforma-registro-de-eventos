import type { PaginatedResponse } from "@/shared/types";
import type { User } from "@prisma/client";
import type { CreateUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import type { UserEntity } from "../entities/user.entity";

export interface UserFilters {
  currentUserId?: string;
}

export interface IUserRepository {
  create(data: CreateUserDTO): Promise<UserEntity>;
  findMany(
    params: { page: number; limit: number },
    filters?: UserFilters,
  ): Promise<PaginatedResponse<UserEntity>>;
  findUnique(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<User | null>;
  update(data: UpdateUserDTO): Promise<UserEntity>;
  updatePassword(userId: string, newPassword: string): Promise<void>;
}
