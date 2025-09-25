import type { PrismaClient } from "@prisma/client";
import type {
  BulkUpdateFieldResponsesDTO,
  CreateFormResponseDTO,
  UpdateFormFieldResponseDTO,
  UpdateFormResponseDTO,
} from "~/domain/dtos/form-response.dto";
import type {
  FormFieldResponseEntity,
  FormResponseEntity,
} from "~/domain/entities/form-response.entity";
import type {
  FormResponseFilters,
  IFormResponseRepository,
} from "~/domain/repositories/form-response.repository";
import { buildWhereClause, calculatePaginationInfo } from "~/shared/lib/utils";
import type { PaginatedResponse } from "~/shared/types";

export const PrismaFormResponseRepository = (
  prisma: PrismaClient,
): IFormResponseRepository => {
  return {
    // Find response by registration ID with all field responses
    findByRegistrationId: async (registrationId: string): Promise<FormResponseEntity | null> => {
      return await prisma.formResponse.findUnique({
        where: { id: registrationId },
        include: {
          fieldResponses: {
            include: {
              field: true, // Include field info for validation/display
            },
          },
          /* registration: {
            include: {
              user: true,
              event: true,
            },
          }, */
        },
      });
    },

    // Find response by ID with all field responses
    findById: async (id: string): Promise<FormResponseEntity | null> => {
      return await prisma.formResponse.findUnique({
        where: { id },
        include: {
          fieldResponses: {
            include: {
              field: true,
            },
          },
          registration: {
            include: {
              user: true,
              event: true,
            },
          },
        },
      });
    },

    // Create response with all field responses atomically
    create: async (data: CreateFormResponseDTO): Promise<FormResponseEntity> => {
      return await prisma.$transaction(async (tx) => {
        // Create the form response first
        const response = await tx.formResponse.create({
          data: {
            registrationId: data.registrationId,
            submittedAt: new Date(),
          },
        });

        // Create all field responses
        if (data.fieldResponses && data.fieldResponses.length > 0) {
          await tx.formFieldResponse.createMany({
            data: data.fieldResponses.map((fieldResponse) => ({
              responseId: response.id,
              fieldId: fieldResponse.fieldId,
              value: fieldResponse.value,
            })),
          });
        }

        // Return response with field responses
        return (await tx.formResponse.findUnique({
          where: { id: response.id },
          include: {
            fieldResponses: {
              include: {
                field: true,
              },
            },
            registration: {
              include: {
                user: true,
                event: true,
              },
            },
          },
        })) as FormResponseEntity;
      });
    },

    // Update response (submittedAt only)
    update: async (data: UpdateFormResponseDTO): Promise<FormResponseEntity> => {
      return await prisma.formResponse.update({
        where: { id: data.id },
        data: {
          submittedAt: new Date(),
        },
        include: {
          fieldResponses: {
            include: {
              field: true,
            },
          },
          registration: {
            include: {
              user: true,
              event: true,
            },
          },
        },
      });
    },

    // Delete response (cascade will delete field responses)
    delete: async (id: string): Promise<void> => {
      await prisma.formResponse.delete({
        where: { id },
      });
    },

    // Update individual field response
    updateFieldResponse: async (data: UpdateFormFieldResponseDTO): Promise<FormFieldResponseEntity> => {
      return await prisma.formFieldResponse.update({
        where: { id: data.id },
        data: {
          value: data.value,
        },
        include: {
          field: true,
          response: true,
        },
      });
    },

    // Bulk update field responses
    bulkUpdateFieldResponses: async (data: BulkUpdateFieldResponsesDTO): Promise<FormResponseEntity> => {
      return await prisma.$transaction(async (tx) => {
        // Update each field response
        for (const fieldResponse of data.fieldUpdates) {
          if (fieldResponse.fieldId) {
            // Update existing field response
            await tx.formFieldResponse.update({
              where: { id: fieldResponse.fieldId },
              data: { value: fieldResponse.value },
            });
          } else {
            // Create new field response
            await tx.formFieldResponse.create({
              data: {
                responseId: data.responseId,
                fieldId: fieldResponse.fieldId,
                value: fieldResponse.value,
              },
            });
          }
        }

        // Return updated response with all field responses
        return (await tx.formResponse.findUnique({
          where: { id: data.responseId },
          include: {
            fieldResponses: {
              include: {
                field: true,
              },
            },
            registration: {
              include: {
                user: true,
                event: true,
              },
            },
          },
        })) as FormResponseEntity;
      });
    },

    // Delete individual field response
    deleteFieldResponse: async (id: string): Promise<void> => {
      await prisma.formFieldResponse.delete({
        where: { id },
      });
    },

    // Find many responses with pagination and filters
    findMany: async (
      params: { page: number; limit: number },
      filters?: FormResponseFilters,
    ): Promise<PaginatedResponse<FormResponseEntity>> => {
      const { page, limit } = params;
      const offset = (page - 1) * limit;

      const where = buildWhereClause(undefined, {
        exactFilters: {
          ...(filters?.registrationId && { registrationId: filters.registrationId }),
        },
        customFilters: {
          // Event filter through registration
          ...(filters?.eventId && {
            registration: {
              eventId: filters.eventId,
            },
          }),

          // User filter through registration
          ...(filters?.userId && {
            registration: {
              userId: filters.userId,
            },
          }),

          // Date filters
          ...(filters?.submittedAt && {
            submittedAt: {
              ...(filters.submittedAt.from && { gte: filters.submittedAt.from }),
              ...(filters.submittedAt.to && { lte: filters.submittedAt.to }),
            },
          }),

          // Has responses filter
          ...(filters?.hasResponses !== undefined && {
            fieldResponses: filters.hasResponses 
              ? { some: {} } 
              : { none: {} },
          }),
        },
      });

      const [responses, total] = await Promise.all([
        prisma.formResponse.findMany({
          where,
          include: {
            fieldResponses: {
              include: {
                field: true,
              },
            },
            registration: {
              include: {
                user: true,
                event: true,
              },
            },
          },
          skip: offset,
          take: limit,
          orderBy: { submittedAt: "desc" },
        }),
        prisma.formResponse.count({ where }),
      ]);

      return {
        data: responses,
        pagination: {
          ...calculatePaginationInfo(total, page, limit),
        },
      };
    },

    // Find responses by event ID
    findByEventId: async (eventId: string): Promise<FormResponseEntity[]> => {
      return await prisma.formResponse.findMany({
        where: {
          registration: {
            eventId,
          },
        },
        include: {
          fieldResponses: {
            include: {
              field: true,
            },
          },
          registration: {
            include: {
              user: true,
              event: true,
            },
          },
        },
        orderBy: { submittedAt: "desc" },
      });
    },

    // Check if response exists for registration
    responseExists: async (registrationId: string): Promise<boolean> => {
      const count = await prisma.formResponse.count({
        where: { registrationId },
      });
      return count > 0;
    },

    // Get field responses by response ID
    getFieldResponsesByResponseId: async (responseId: string): Promise<FormFieldResponseEntity[]> => {
      return await prisma.formFieldResponse.findMany({
        where: { responseId },
        include: {
          field: true,
          response: true,
        },
        orderBy: { field: { order: "asc" } },
      });
    },

    // Count responses by event
    countResponsesByEvent: async (eventId: string): Promise<number> => {
      return await prisma.formResponse.count({
        where: {
          registration: {
            eventId,
          },
        },
      });
    },
  };
};