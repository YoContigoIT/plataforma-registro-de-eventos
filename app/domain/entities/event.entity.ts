import type { Prisma, Event as PrismaEvent } from "@prisma/client";

export type EventEntity = PrismaEvent;

export type EventEntityWithEventForm = Prisma.EventGetPayload<{
  include: {
    EventForm: {
      include: {
        fields: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    },
  }
}>;

export type EventEntityWithOrganizer = Prisma.EventGetPayload<{
  include: {
    organizer: true,
  }
}>;

export type EventEntityWithRegistrations = Prisma.EventGetPayload<{
  include: {
    registrations: true,
  }
}>;

export type EventEntityWithRelations = EventEntityWithEventForm & EventEntityWithOrganizer & EventEntityWithRegistrations;
