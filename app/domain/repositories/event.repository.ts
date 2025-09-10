import type { EventStatus } from "@prisma/client";
import type { PaginatedResponse } from "~/shared/types";
import type { CreateEventDTO, UpdateEventDTO } from "../dtos/event.dto";
import type { EventEntity } from "../entities/event.entity";

export interface EventFilters {
  organizerId?: string;
  title?: string;
  date?: Date;
  location?: string;
  status?: EventStatus;
  archived?: boolean;
  dateRange?: {
    startDate?: Date;
    endDate?: Date;
  };
}

export interface IEventRepository {
  findMany(
    params: { page: number; limit: number },
    filters?: EventFilters,
  ): Promise<PaginatedResponse<EventEntity>>;
  findUnique(id: string): Promise<EventEntity | null>;
  findByOrganizerId(organizerId: string): Promise<EventEntity[]>;
  create(data: CreateEventDTO): Promise<EventEntity>;
  update(data: UpdateEventDTO): Promise<EventEntity>;
  delete(id: string): Promise<void>;
  softDelete(id: string): Promise<void>;
}
