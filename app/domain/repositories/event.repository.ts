import type { EventStatus } from "@prisma/client";
import type { PaginatedResponse } from "~/shared/types";
import type { CreateEventDTO, UpdateEventDTO } from "../dtos/event.dto";
import type { EventEntity } from "../entities/event.entity";

export interface EventFilters {
  organizerId?: string;
  status?: EventStatus;
  location?: string;
  archived?: boolean;
  search?: string;
  name?: string;
  description?: string;
  agenda?: string;
  capacity?: {
    min?: number;
    max?: number;
  };
  maxTickets?: {
    min?: number;
    max?: number;
  };

  //Filtros de fechas
  startDate?: {
    from?: Date;
    to?: Date;
  };
  endDate?: {
    from?: Date;
    to?: Date;
  };
  dateRange?: {
    startDate?: Date;
    endDate?: Date;
  };

  //Filtros de fechas de sistema
  createdAt?: {
    from?: Date;
    to?: Date;
  };
  updatedAt?: {
    from?: Date;
    to?: Date;
  };

  //Filtros opcionales
  hasAvailableSpots?: boolean; //Eventos con espacios disponibles
  isUpcoming?: boolean; //Solo eventos futuros
  isActive?: boolean; //Solo eventos activos (no cancelados/archivados)
}

export interface IEventRepository {
  findMany(
    params?: { page: number; limit: number },
    filters?: EventFilters
  ): Promise<PaginatedResponse<EventEntity>>;
  findUnique(id: string): Promise<EventEntity | null>;
  findByOrganizerId(organizerId: string): Promise<EventEntity[]>;
  create(data: CreateEventDTO): Promise<EventEntity>;
  update(data: UpdateEventDTO): Promise<EventEntity>;
  delete(id: string): Promise<void>;
  softDelete(id: string): Promise<void>;
  countByStatus(
    status: EventStatus,
    dateFilter?: { from?: Date; to?: Date }
  ): Promise<number>;
  countAllStatuses(dateFilter?: { from?: Date; to?: Date }): Promise<{
    [key in EventStatus]: number;
  }>;
  findByStatusAndDateRange(
    status: EventStatus,
    dateRange?: { from?: Date; to?: Date },
    limit?: number
  ): Promise<EventEntity[]>;
  findUpcomingEvents(
    daysAhead: number,
    statuses?: EventStatus[],
    limit?: number
  ): Promise<EventEntity[]>;
}
