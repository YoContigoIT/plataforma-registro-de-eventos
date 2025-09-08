import { PrismaClient } from "@prisma/client";
import { seedEvents } from "./seed/event";
import { seedRegistrations } from "./seed/registration";
import { seedUsers } from "./seed/user";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seeding...");

  console.log("Clearing existing data...");
  await prisma.registration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  console.log("Existing data cleared successfully");
  
  // Seed in order of dependencies
  await seedUsers(prisma);
  console.log("Users seeded successfully");

  await seedEvents(prisma);
  console.log("Events seeded successfully");

  await seedRegistrations(prisma);
  console.log("Registrations seeded successfully");

  console.log("Seeding completed successfully");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Error during seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
