import type {
    CreateEventFormDTO,
    ReorderFieldsDTO,
    UpdateEventFormDTO,
    UpdateFormFieldDTO,
} from "../dtos/event-form.dto";
import type {
    EventFormEntity,
    FormFieldEntity,
} from "../entities/event-form.entity";

export interface EventFormFilters {
  eventId?: string;
  isActive?: boolean;
  search?: string; // Search in title/description
  createdAt?: {
    from?: Date;
    to?: Date;
  };
}

export interface IEventFormRepository {
  // Event Form CRUD (creates form + fields atomically)
  findByEventId(eventId: string): Promise<EventFormEntity | null>;
  create(data: CreateEventFormDTO): Promise<EventFormEntity>; // Creates form + all fields
  update(data: UpdateEventFormDTO): Promise<EventFormEntity>;
  delete(id: string): Promise<void>;

  // Individual Field Management (for editing existing forms)
  updateField(data: UpdateFormFieldDTO): Promise<FormFieldEntity>;
  deleteField(id: string): Promise<void>;
  reorderFields(data: ReorderFieldsDTO): Promise<void>;

  // Utility Methods
  formExists(eventId: string): Promise<boolean>;
  getFieldsByFormId(formId: string): Promise<FormFieldEntity[]>;
}
