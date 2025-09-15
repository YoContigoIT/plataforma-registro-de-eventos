import type { RegistrationStatus } from "@prisma/client";
import type { PaginatedResponse } from "~/shared/types";
import type { CreateRegistrationDto, UpdateRegistrationDto } from "../dtos/registration.dto";
import type { RegistrationEntity, RegistrationWithRelations } from "../entities/registration.entity";

export interface RegistrationFilters {
  userId?: string;
  eventId?: string;
  status?: RegistrationStatus;
  search?: string;
  statuses?: RegistrationStatus[];
  invitedAt?: {
    from?: Date;
    to?: Date;
  };
  respondedAt?: {
    from?: Date;
    to?: Date;
  };
  registeredAt?: {
    from?: Date;
    to?: Date;
  };
  checkedInAt?: {
    from?: Date;
    to?: Date;
  };
  createdAt?: {
    from?: Date;
    to?: Date;
  };
  updatedAt?: {
    from?: Date;
    to?: Date;
  };
  eventStartDate?: {
    from?: Date;
    to?: Date;
  };
  eventEndDate?: {
    from?: Date;
    to?: Date;
  };
  hasResponded?: boolean;
  isCheckedIn?: boolean;
  hasInviteToken?: boolean;
  isPending?: boolean;
  isRegistered?: boolean;
  isWaitlisted?: boolean;
  isCancelled?: boolean;
  isDeclined?: boolean;
  eventStatus?: string;
  eventOrganizerId?: string;
  isUpcomingEvent?: boolean;
  isPastEvent?: boolean;
  isActiveEvent?: boolean;
  respondedWithin?: {
    hours?: number;
    days?: number;
  };
  pendingInvites?: boolean;
  expiredInvites?: boolean;
}

export interface IRegistrationRepository {
  findMany(
    params: { 
      page: number; 
      limit: number; 
      sortBy?: string; 
      sortDirection?: "asc" | "desc" 
    },
    filters?: RegistrationFilters
  ): Promise<PaginatedResponse<RegistrationWithRelations>>;
  findOne(id: string): Promise<RegistrationWithRelations | null>;
  findByUserId(userId: string): Promise<RegistrationEntity[]>;
  findByEventId(eventId: string): Promise<RegistrationEntity[]>;
  findExactInvitation(eventId: string, userId: string): Promise<RegistrationWithRelations | null>;
  registrationExists(eventId: string, userId: string): Promise<boolean>;
  findByInviteToken(inviteToken: string): Promise<RegistrationWithRelations | null>;
  create(data: CreateRegistrationDto): Promise<RegistrationEntity>;
  update(data: UpdateRegistrationDto): Promise<RegistrationEntity>;
  delete(id: string): Promise<void>;
  countRegistrations(data: {
    userId?: string;
    eventId?: string;
  }): Promise<number>;
  countByStatus(eventId: string, status: RegistrationStatus): Promise<number>;
  countAllStatusesByEvent(eventId: string): Promise<{
    [key in RegistrationStatus]: number;
  }>;
}
