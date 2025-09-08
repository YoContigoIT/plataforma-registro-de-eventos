import { type PrismaClient, type User, UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function seedUsers(prisma: PrismaClient) {

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: "admin@eventos.com",
      name: "Administrador Sistema",
      password: await hashPassword("AdminPass123!"),
      role: UserRole.ADMIN,
      company: "Gestión de Eventos S.L.",
      title: "Administrador del Sistema",
      phone: "+523323456780",
    },
  });

  // Create organizer users
  const organizer1 = await prisma.user.create({
    data: {
      email: "organizador1@eventos.com",
      name: "Juan Organizador",
      password: await hashPassword("OrganizadorPass123!"),
      role: UserRole.ORGANIZER,
      company: "Eventos Tecnológicos S.A.",
      title: "Gestor de Eventos",
      phone: "+523387654320",
    },
  });

  const organizer2 = await prisma.user.create({
    data: {
      email: "organizador2@eventos.com",
      name: "María Planificadora",
      password: await hashPassword("PlanificadoraPass123!"),
      role: UserRole.ORGANIZER,
      company: "Soluciones para Conferencias",
      title: "Planificadora Senior de Eventos",
      phone: "+523312233440",
    },
  });

  // Create attendee users
  const attendees: User[] = [];
  for (let i = 1; i <= 5; i++) {
    attendees.push(
      await prisma.user.create({
        data: {
          email: `asistente${i}@eventos.com`,
          name: `Asistente ${i}`,
          password: await hashPassword(`AsistentePass${i}123!`),
          role: UserRole.ATTENDEE,
          company: i % 2 === 0 ? "Corporación Tecnológica" : "Soluciones Digitales",
          title: i % 2 === 0 ? "Desarrollador de Software" : "Gerente de Producto",
          phone: `+5233{i}${i}0${i}${i}${i}${i}${i}${i}`,
        },
      }),
    );
  }

  return { admin, organizer1, organizer2, attendees };
}
