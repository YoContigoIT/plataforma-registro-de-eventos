import type { RegistrationStatus } from "@prisma/client";
import type { PaginatedResponse } from "~/shared/types";
import type {
  CreateRegistrationDto,
  UpdateRegistrationDto,
} from "../dtos/registration.dto";
import type {
  RegistrationEntity,
  RegistrationWithFullRelations,
  RegistrationWithRelations,
} from "../entities/registration.entity";

export interface RegistrationFilters {
  userId?: string;
  eventId?: string;
  status?: RegistrationStatus;
  search?: string;
  statuses?: RegistrationStatus[];

  // Date filters - simplified to match event repository pattern
  invitedAt?: Date;
  respondedAt?: Date;
  registeredAt?: Date;
  checkedInAt?: Date;

  // System date filters
  createdAt?: {
    from?: Date;
    to?: Date;
  };
  updatedAt?: {
    from?: Date;
    to?: Date;
  };

  // Time-based filters
  respondedWithin?: {
    hours?: number;
    days?: number;
  };
  
  // Invite management filters
  pendingInvites?: boolean;
  expiredInvites?: boolean;

  // Boolean filters
  hasResponded?: boolean;
  isCheckedIn?: boolean;
  
  // Status convenience filters
  isPending?: boolean;
  isRegistered?: boolean;
  isWaitlisted?: boolean;
  isCancelled?: boolean;
  isDeclined?: boolean;

  /* Event-related filters - commented out as we don't filter by events right now
  eventStatus?: string;
  eventOrganizerId?: string;
  isUpcomingEvent?: boolean;
  isPastEvent?: boolean;
  isActiveEvent?: boolean; */

  /* Event date filters - commented out as we don't filter by events right now
  eventStartDate?: {
    from?: Date;
    to?: Date;
  };
  eventEndDate?: {
    from?: Date;
    to?: Date;
  }; */
}

export interface IRegistrationRepository {
  findMany(
    params: {
      page: number;
      limit: number;
      sortBy?: string;
      sortDirection?: "asc" | "desc";
    },
    filters?: RegistrationFilters
  ): Promise<PaginatedResponse<RegistrationWithFullRelations>>;
  findOne(id: string): Promise<RegistrationWithFullRelations | null>;
  findByEmailAndEventId(
    email: string,
    eventId: string
  ): Promise<RegistrationWithFullRelations | null>;
  findByUserId(userId: string): Promise<RegistrationEntity[]>;
  findByEventId(eventId: string): Promise<RegistrationWithRelations[]>;
  findByQrCode(qrCode: string): Promise<RegistrationWithRelations | null>;
  findExactInvitation(
    eventId: string,
    userId: string
  ): Promise<RegistrationWithRelations | null>;
  registrationExists(eventId: string, userId: string): Promise<boolean>;
  create(data: CreateRegistrationDto): Promise<RegistrationEntity>;
  update(data: UpdateRegistrationDto): Promise<RegistrationEntity>;
  delete(id: string): Promise<void>;

  countByStatus(eventId: string, status: RegistrationStatus): Promise<number>;
  countAllStatusesByEvent(eventId: string): Promise<{
    [key in RegistrationStatus]: number;
  }>;
  findTickesPurchased(
    eventId: string,
    userId: string
  ): Promise<RegistrationEntity | null>;
}
