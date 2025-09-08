import { type PrismaClient, type User, UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function seedUsers(prisma: PrismaClient) {
  // Clear existing users if needed
  await prisma.user.deleteMany();

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "Admin User",
      password: await hashPassword("admin123"),
      role: UserRole.ADMIN,
      company: "Event Manager Inc.",
      title: "System Administrator",
      phone: "+1234567890",
    },
  });

  // Create organizer users
  const organizer1 = await prisma.user.create({
    data: {
      email: "organizer1@example.com",
      name: "John Organizer",
      password: await hashPassword("organizer123"),
      role: UserRole.ORGANIZER,
      company: "Tech Events Ltd",
      title: "Event Manager",
      phone: "+1987654321",
    },
  });

  const organizer2 = await prisma.user.create({
    data: {
      email: "organizer2@example.com",
      name: "Jane Planner",
      password: await hashPassword("planner123"),
      role: UserRole.ORGANIZER,
      company: "Conference Solutions",
      title: "Senior Event Planner",
      phone: "+1122334455",
    },
  });

  // Create attendee users
  const attendees: User[] = [];
  for (let i = 1; i <= 5; i++) {
    attendees.push(
      await prisma.user.create({
        data: {
          email: `attendee${i}@example.com`,
          name: `Attendee ${i}`,
          password: await hashPassword(`attendee${i}`),
          role: UserRole.ATTENDEE,
          company: i % 2 === 0 ? "Tech Corp" : "Digital Solutions",
          title: i % 2 === 0 ? "Software Developer" : "Product Manager",
          phone: `+1${i}00${i}00${i}00`,
        },
      }),
    );
  }

  return { admin, organizer1, organizer2, attendees };
}
