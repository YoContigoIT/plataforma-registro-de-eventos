import type { PaginatedResponse } from "~/shared/types";
import type {
  BulkUpdateFieldResponsesDTO,
  CreateFormResponseDTO,
  UpdateFormFieldResponseDTO,
  UpdateFormResponseDTO,
} from "../dtos/form-response.dto";
import type {
  FormFieldResponseEntity,
  FormResponseAnswers,
  FormResponseEntity,
  FormResponseEntityWithFields
} from "../entities/form-response.entity";

export interface FormResponseFilters {
  registrationId?: string;
  eventId?: string; // Filter by event through registration
  userId?: string; // Filter by user through registration
  submittedAt?: {
    from?: Date;
    to?: Date;
  };
  hasResponses?: boolean; // Filter responses that have field responses
}

export interface IFormResponseRepository {
  // Form Response CRUD (creates response + all field responses atomically)
  findByRegistrationId(registrationId: string): Promise<FormResponseAnswers | null>;
  findByRegistrationIdWithFields(registrationId: string): Promise<FormResponseEntityWithFields | null>;
  findById(id: string): Promise<FormResponseEntity | null>;
  create(data: CreateFormResponseDTO): Promise<FormResponseEntity>;
  update(data: UpdateFormResponseDTO): Promise<FormResponseEntity>;
  delete(id: string): Promise<void>;

  // Field Response Management
  updateFieldResponse(data: UpdateFormFieldResponseDTO): Promise<FormFieldResponseEntity>;
  bulkUpdateFieldResponses(data: BulkUpdateFieldResponsesDTO): Promise<FormResponseEntity>;
  deleteFieldResponse(id: string): Promise<void>;

  // Query Methods
  findMany(
    params: { page: number; limit: number },
    filters?: FormResponseFilters,
  ): Promise<PaginatedResponse<FormResponseEntity>>;
  findByEventId(eventId: string): Promise<FormResponseEntity[]>;
  
  // Utility Methods
  responseExists(registrationId: string): Promise<boolean>;
  getFieldResponsesByResponseId(responseId: string): Promise<FormFieldResponseEntity[]>;
  countResponsesByEvent(eventId: string): Promise<number>;
}