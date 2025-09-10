import type { PrismaClient } from "@prisma/client";
import type { IEncryptorRepository } from "~/domain/repositories/encrypt.repository";
import type { IEventRepository } from "~/domain/repositories/event.repository";
import type { IJWTRepository } from "~/domain/repositories/jwt.repository";
import type { ISessionRepository } from "~/domain/repositories/session.repository";
import type { IUserRepository } from "~/domain/repositories/user.repository";
import type { IEmailService } from "~/domain/services/email.service";
import type { IRegistrationRepository } from "~/domain/repositories/registration.repository";
import { bcryptRepository } from "../auth/bcrypt.repository";
import { JWTRepository } from "../auth/jwt.repository";
import { PrismaEventRepository } from "../repositories/prisma/event.repository";
import { PrismaRegistrationRepository } from "../repositories/prisma/registration.repository";
import { PrismaSessionRepository } from "../repositories/prisma/session.repository";
import { PrismaUserRepository } from "../repositories/prisma/user.repository";
import { EmailService } from "../services/email.service";

export interface IRepositoriesContainer {
  jwtRepository: IJWTRepository;
  encryptorRepository: IEncryptorRepository;
  userRepository: IUserRepository;
  sessionRepository: ISessionRepository;
  eventRepository: IEventRepository;
  registrationRepository: IRegistrationRepository;
}

export interface IServicesContainer {
  emailService: IEmailService;
}

export interface IDependenciesContainer {
  repositories: IRepositoriesContainer;
  services: IServicesContainer;
}

/**
 * Contenedor de inyección de dependencias para repositorios
 * Centraliza la creación e inyección de todas las dependencias de repositorios
 */
export const createRepositoriesContainer = (
  prisma: PrismaClient
): IRepositoriesContainer => {
  const jwtRepository = JWTRepository();
  const encryptorRepository = bcryptRepository();
  const userRepository = PrismaUserRepository(prisma);
  const sessionRepository = PrismaSessionRepository(prisma, jwtRepository);
  const eventRepository = PrismaEventRepository(prisma);
  const registrationRepository = PrismaRegistrationRepository(prisma);

  return {
    encryptorRepository,
    jwtRepository,
    userRepository,
    sessionRepository,
    eventRepository,
    registrationRepository,
  };
};

/**
 * Contenedor de inyección de dependencias para servicios
 * Centraliza la creación e inyección de todas las dependencias de servicios
 */
export const createServicesContainer = (
  repositories: IRepositoriesContainer,
): IServicesContainer => {
  const emailService = EmailService();

  return {
    emailService,
  };
};

/**
 * Contenedor principal de dependencias
 * Combina repositorios y servicios en un solo contenedor
 */
export const createDependenciesContainer = (
  prisma: PrismaClient
): IDependenciesContainer => {
  const repositories = createRepositoriesContainer(prisma);
  const services = createServicesContainer(repositories);

  return {
    repositories,
    services,
  };
};
