import {
  type PrismaClient,
  type Registration,
  RegistrationStatus,
} from "@prisma/client";
import * as crypto from "crypto";

// Generate a unique QR code for each registration
function generateQRCode(userId: string, eventId: string): string {
  return crypto
    .createHash("sha256")
    .update(`${userId}-${eventId}-${Date.now()}`)
    .digest("hex");
}

export async function seedRegistrations(prisma: PrismaClient) {
  // Get attendees
  const attendees = await prisma.user.findMany({
    where: {
      role: "ATTENDEE",
    },
  });

  // Get events
  const events = await prisma.event.findMany();

  if (attendees.length === 0 || events.length === 0) {
    throw new Error(
      "No attendees or events found. Please seed users and events first.",
    );
  }

  const registrations: Registration[] = [];

  // For each event, register some attendees
  for (const event of events) {
    // Skip draft events
    if (event.status === "DRAFT") continue;

    // Register all attendees for the first event (UPCOMING)
    if (event.status === "UPCOMING" && registrations.length === 0) {
      for (const attendee of attendees) {
        registrations.push(
          await prisma.registration.create({
            data: {
              qrCode: generateQRCode(attendee.id, event.id),
              status: RegistrationStatus.REGISTERED,
              userId: attendee.id,
              eventId: event.id,
            },
          }),
        );
      }
    }
    // For ONGOING events, register some attendees and check some in
    else if (event.status === "ONGOING") {
      for (let i = 0; i < Math.min(3, attendees.length); i++) {
        const status =
          i < 2 ? RegistrationStatus.CHECKED_IN : RegistrationStatus.REGISTERED;

        registrations.push(
          await prisma.registration.create({
            data: {
              qrCode: generateQRCode(attendees[i].id, event.id),
              status: status,
              userId: attendees[i].id,
              eventId: event.id,
            },
          }),
        );
      }
    }
    // For ENDED events, register and check in some attendees
    else if (event.status === "ENDED") {
      for (let i = 0; i < Math.min(4, attendees.length); i++) {
        const status =
          i < 3 ? RegistrationStatus.CHECKED_IN : RegistrationStatus.CANCELLED;

        registrations.push(
          await prisma.registration.create({
            data: {
              qrCode: generateQRCode(attendees[i].id, event.id),
              status: status,
              userId: attendees[i].id,
              eventId: event.id,
            },
          }),
        );
      }
    }
  }

  return registrations;
}
