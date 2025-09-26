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
      "No attendees or events found. Please seed users and events first."
    );
  }

  const registrations: Registration[] = [];

  // For each event, register some attendees
  for (const event of events) {
    // Skip draft events
    if (event.status === "DRAFT") continue;

    // Register all attendees for the first UPCOMING event
    if (event.status === "UPCOMING" && registrations.length === 0) {
      for (let i = 0; i < attendees.length; i++) {
        const attendee = attendees[i];
        const invitedAt = new Date(Date.now() - (7 - i) * 24 * 60 * 60 * 1000); // Invited 1-7 days ago
        const respondedAt = i < 4 ? new Date(invitedAt.getTime() + 2 * 60 * 60 * 1000) : null; // Some responded 2 hours after invite
        const registeredAt = respondedAt ? new Date(respondedAt.getTime() + 30 * 60 * 1000) : null; // Registered 30 min after responding
        
        // Mix of statuses
        let status: RegistrationStatus;
        if (i === 0) status = RegistrationStatus.PENDING; // Still pending
        else if (i === 1) status = RegistrationStatus.DECLINED; // Declined
        else if (i === 2) status = RegistrationStatus.WAITLISTED; // Waitlisted
        else status = RegistrationStatus.REGISTERED; // Registered

        registrations.push(
          await prisma.registration.create({
            data: {
              qrCode: generateQRCode(attendee.id, event.id),
              status: status,
              userId: attendee.id,
              eventId: event.id,
              invitedAt: invitedAt,
              respondedAt: respondedAt,
              registeredAt: registeredAt,
              purchasedTickets: status === RegistrationStatus.REGISTERED ? Math.floor(Math.random() * 2) + 1 : null, // 1-2 tickets
            },
          })
        );
      }
    }
    // For ONGOING events, register some attendees and check some in
    else if (event.status === "ONGOING") {
      for (let i = 0; i < Math.min(3, attendees.length); i++) {
        const attendee = attendees[i];
        const invitedAt = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // Invited 10 days ago
        const respondedAt = new Date(invitedAt.getTime() + 1 * 60 * 60 * 1000); // Responded 1 hour after
        const registeredAt = new Date(respondedAt.getTime() + 15 * 60 * 1000); // Registered 15 min after
        const checkedInAt = i < 2 ? new Date(Date.now() - 1 * 60 * 60 * 1000) : null; // Some checked in 1 hour ago
        
        const status = i < 2 ? RegistrationStatus.CHECKED_IN : RegistrationStatus.REGISTERED;

        registrations.push(
          await prisma.registration.create({
            data: {
              qrCode: generateQRCode(attendee.id, event.id),
              status: status,
              userId: attendee.id,
              eventId: event.id,
              invitedAt: invitedAt,
              respondedAt: respondedAt,
              registeredAt: registeredAt,
              checkedInAt: checkedInAt,
              purchasedTickets: 1,
            },
          })
        );
      }
    }
    // For ENDED events, register and check in some attendees
    else if (event.status === "ENDED") {
      for (let i = 0; i < Math.min(4, attendees.length); i++) {
        const attendee = attendees[i];
        const invitedAt = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000); // Invited 20 days ago
        const respondedAt = new Date(invitedAt.getTime() + 3 * 60 * 60 * 1000); // Responded 3 hours after
        const registeredAt = i < 3 ? new Date(respondedAt.getTime() + 45 * 60 * 1000) : null; // Most registered
        const checkedInAt = i < 3 ? new Date(Date.now() - 16 * 24 * 60 * 60 * 1000) : null; // Checked in during event
        
        const status = i < 3 ? RegistrationStatus.CHECKED_IN : RegistrationStatus.CANCELLED;

        registrations.push(
          await prisma.registration.create({
            data: {
              qrCode: generateQRCode(attendee.id, event.id),
              status: status,
              userId: attendee.id,
              eventId: event.id,
              invitedAt: invitedAt,
              respondedAt: respondedAt,
              registeredAt: registeredAt,
              checkedInAt: checkedInAt,
              purchasedTickets: status === RegistrationStatus.CHECKED_IN ? 1 : null,
            },
          })
        );
      }
    }
  }

  return registrations;
}
