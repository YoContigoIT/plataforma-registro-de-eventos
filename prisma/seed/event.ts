import { type Event, EventStatus, type PrismaClient } from "@prisma/client";

export async function seedEvents(prisma: PrismaClient) {
  // Clear existing events if needed
  await prisma.event.deleteMany();

  // Get organizers to assign events to
  const organizers = await prisma.user.findMany({
    where: {
      role: "ORGANIZER",
    },
  });

  if (organizers.length === 0) {
    throw new Error("No organizers found. Please seed users first.");
  }

  // Create events
  const events: Event[] = [];

  // Upcoming events
  events.push(
    await prisma.event.create({
      data: {
        name: "Tech Conference 2023",
        start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        end_date: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000), // 32 days from now
        location: "Convention Center, New York",
        agenda:
          "Day 1: Registration, Keynote, Workshops\nDay 2: Panel Discussions, Networking",
        capacity: 500,
        description:
          "Annual technology conference featuring the latest innovations and industry trends.",
        maxTickets: 2,
        remainingCapacity: 500,
        status: EventStatus.UPCOMING,
        organizerId: organizers[0].id,
      },
    })
  );

  events.push(
    await prisma.event.create({
      data: {
        name: "Product Management Workshop",
        start_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // Same day event
        location: "Innovation Hub, San Francisco",
        agenda:
          "9:00 AM - Registration\n10:00 AM - Workshop Begins\n12:00 PM - Lunch\n4:00 PM - Closing Remarks",
        capacity: 50,
        description:
          "Intensive one-day workshop on modern product management methodologies.",
        maxTickets: 1,
        remainingCapacity: 50,
        status: EventStatus.UPCOMING,
        organizerId: organizers[1].id,
      },
    })
  );

  // Ongoing event
  events.push(
    await prisma.event.create({
      data: {
        name: "Developer Hackathon",
        start_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Started yesterday
        end_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Ends tomorrow
        location: "Tech Campus, Austin",
        agenda:
          "Day 1: Team Formation, Project Planning\nDay 2: Development\nDay 3: Presentations, Awards",
        capacity: 100,
        description:
          "72-hour hackathon for developers to build innovative solutions.",
        maxTickets: 1,
        remainingCapacity: 100,
        status: EventStatus.ONGOING,
        organizerId: organizers[0].id,
      },
    })
  );

  // Ended event
  events.push(
    await prisma.event.create({
      data: {
        name: "Marketing Summit",
        start_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        end_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        location: "Grand Hotel, Chicago",
        agenda:
          "Day 1: Digital Marketing Trends\nDay 2: Brand Strategy Workshop",
        capacity: 200,
        description:
          "Annual summit for marketing professionals to discuss industry trends and strategies.",
        maxTickets: 2,
        remainingCapacity: 200,
        status: EventStatus.ENDED,
        organizerId: organizers[1].id,
      },
    })
  );

  // Draft event
  events.push(
    await prisma.event.create({
      data: {
        name: "Leadership Retreat",
        start_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        end_date: new Date(Date.now() + 62 * 24 * 60 * 60 * 1000), // 62 days from now
        location: "Mountain Resort, Colorado",
        agenda: "TBD",
        capacity: 30,
        description:
          "Executive leadership retreat focused on strategy and team building.",
        maxTickets: 1,
        remainingCapacity: 30,
        status: EventStatus.DRAFT,
        organizerId: organizers[0].id,
      },
    })
  );

  return events;
}
