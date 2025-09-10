import type { CreateRegistrationDto } from "../dtos/registration.dto";
import type { RegistrationEntity } from "../entities/registration.entity";

export interface IRegistrationRepository {
  create: (data: CreateRegistrationDto) => Promise<RegistrationEntity>;
  countRegistrations: (data: {
    userId?: string;
    eventId?: string;
  }) => Promise<number>;
}
