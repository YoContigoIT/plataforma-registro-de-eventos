import { Temporal } from "@js-temporal/polyfill";
import { type ClassValue, clsx } from "clsx";
import * as crypto from "crypto";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";
import type { ZodError } from "zod";
import type { UserEntity } from "~/domain/entities/user.entity";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* export function simplifyZodErrors<T>(
  error: z.ZodError<T>,
): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  error.errors.forEach((err) => {
    if (err.path.length > 0) {
      const key = err.path.join(".");
      if (!errors[key]) {
        errors[key] = [];
      }
      errors[key].push(err.message);
    }
  });
  return errors;
}

export function formatName(
  person: Partial<User> | Omit<User, "password"> | null,
) {
  if (!person) {
    return "No hay información de la persona";
  }
  const apellidoPaterno = person
    ? person.apellido_paterno
    : "";
  const apellidoMaterno = person.apellido_materno
    ? person.apellido_materno
    : "";
  return `${person.nombre} ${apellidoPaterno} ${apellidoMaterno}`;
}

export function getUserInitials(user: Partial<User>) {
  const nombreInitial = user.nombre?.charAt(0) || "";
  const apellido_paternoInitial = user.apellido_paterno?.charAt(0) || "";
  const apellido_maternoInitial = user.apellido_materno?.charAt(0) || "";
  return (
    nombreInitial +
    apellido_paternoInitial +
    apellido_maternoInitial
  ).toUpperCase();
} */

// Using Temporal API for modern, reliable date handling
// Temporal provides better timezone support, immutable objects, and more reliable parsing
export function formatDate(date: Date | null | undefined): string {
  if (!date) {
    return "Fecha no disponible";
  }

  try {
    const instant = Temporal.Instant.fromEpochMilliseconds(date.getTime());
    const temporalDate = instant
      .toZonedDateTimeISO(Temporal.Now.timeZoneId())
      .toPlainDate();

    return temporalDate.toLocaleString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "Fecha inválida";
  }
}

export function formatDateTime(date: string | Date): string {
  if (typeof date === "string") {
    // Parse ISO string and format
    const dateObj = new Date(date);
    return dateObj.toLocaleString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } else {
    // Format Date object directly
    return date.toLocaleString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}

// Format time only (HH:MM format)
export function formatTime(date: string | Date | null | undefined): string {
  if (!date) {
    return "Hora no disponible";
  }

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return "Hora inválida";
    }

    return dateObj.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // Use 24-hour format
    });
  } catch {
    return "Hora inválida";
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
}

// Re-export badge utilities for backward compatibility
export {
  formatRoleName,
  getEmployeeStatusBadge,
  getFundingStatusBadge,
  getMovementTypeBadge,
  getPayrollStatusBadge,
  getPurchaseOrderStatusBadge,
  getSessionStatusBadge,
  getUserRoleBadge,
} from "./badge-utils";

// Legacy function for backward compatibility - deprecated
export function getRoleBadgeVariant(rol: string): string {
  const rolColors = {
    super_admin: "bg-red-100 text-red-800 border-red-200",
    admin: "bg-sky-100 text-sky-800 border-sky-200",
    usuario: "bg-emerald-100 text-emerald-800 border-emerald-200",
  };
  return (
    rolColors[rol as keyof typeof rolColors] || "bg-gray-100 text-gray-800"
  );
}

// Date formatting utilities for data tables
export function formatDateShort(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(dateObj);
}

export function formatDateWithDateFns(date: Date | string): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "d 'de' MMMM 'de' yyyy", { locale: es });
}

// Format date using Temporal API in DD/MM/YYYY format
export function formatDateShortTemporal(date: Date | string): string {
  if (!date) {
    return "Fecha no disponible";
  }

  try {
    let instant: Temporal.Instant;

    if (typeof date === "string") {
      // Parse ISO string to Instant
      instant = Temporal.Instant.from(date);
    } else {
      // Convert Date object to Instant
      instant = Temporal.Instant.fromEpochMilliseconds(date.getTime());
    }

    const temporalDate = instant
      .toZonedDateTimeISO(Temporal.Now.timeZoneId())
      .toPlainDate();

    // Format as DD/MM/YYYY
    const day = temporalDate.day.toString().padStart(2, "0");
    const month = temporalDate.month.toString().padStart(2, "0");
    const year = temporalDate.year.toString();

    return `${day}/${month}/${year}`;
  } catch {
    return "Fecha inválida";
  }
}

// Parse date string safely using Temporal API
export function parseDate(
  dateString: string | undefined | null,
): Date | undefined {
  if (!dateString || dateString === "") {
    return undefined;
  }

  try {
    // Try to parse as ISO date string first
    const plainDate = Temporal.PlainDate.from(dateString);
    return new Date(plainDate.year, plainDate.month - 1, plainDate.day);
  } catch {
    try {
      // Fallback to regular Date parsing
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return undefined;
      }
      return date;
    } catch {
      return undefined;
    }
  }
}

// Tipos para la configuración de buildWhereClause
export interface SearchField {
  field?: string;
  mode?: "insensitive" | "sensitive";
  relation?: string; // Para búsquedas en relaciones como "fondeador.nombre"
}

export interface DateRangeFilter {
  field: string;
  startDate?: Date;
  endDate?: Date;
}

export interface WhereClauseConfig {
  searchFields?: SearchField[];
  exactFilters?: Record<string, unknown>;
  dateRangeFilter?: DateRangeFilter;
  customFilters?: Record<string, unknown>;
}

/**
 * Utilidad genérica para construir cláusulas WHERE de Prisma
 * @param searchTerm - Término de búsqueda general
 * @param config - Configuración de campos y filtros
 * @returns Objeto WHERE de Prisma
 */
export function buildWhereClause(
  searchTerm?: string,
  config: WhereClauseConfig = {},
): Record<string, unknown> {
  const where: Record<string, unknown> = {};

  // Manejo de búsqueda de texto
  if (searchTerm && config.searchFields && config.searchFields.length > 0) {
    where.OR = config.searchFields.map((searchField) => {
      const condition: Record<string, unknown> = {};

      if (searchField.relation) {
        // Para búsquedas en relaciones (ej: "fondeador.nombre")
        const [relationName, fieldName] = searchField.relation.split(".");
        condition[relationName] = {
          [fieldName]: {
            contains: searchTerm,
            mode: searchField.mode || "insensitive",
          },
        };
      } else if (searchField.field) {
        // Check if field contains dot notation for nested fields
        if (searchField.field.includes(".")) {
          const [relationName, fieldName] = searchField.field.split(".");
          condition[relationName] = {
            [fieldName]: {
              contains: searchTerm,
              mode: searchField.mode || "insensitive",
            },
          };
        } else {
          // Para búsquedas directas
          condition[searchField.field] = {
            contains: searchTerm,
            mode: searchField.mode || "insensitive",
          };
        }
      }

      return condition;
    });
  }

  // Manejo de filtros exactos
  if (config.exactFilters) {
    Object.entries(config.exactFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        where[key] = value;
      }
    });
  }

  // Manejo de rangos de fechas
  if (config.dateRangeFilter) {
    const { field, startDate, endDate } = config.dateRangeFilter;
    if (startDate || endDate) {
      where[field] = {};
      if (startDate) {
        (where[field] as Record<string, unknown>).gte = startDate;
      }
      if (endDate) {
        (where[field] as Record<string, unknown>).lte = endDate;
      }
    }
  }

  // Manejo de filtros personalizados
  if (config.customFilters) {
    Object.entries(config.customFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        where[key] = value;
      }
    });
  }

  return where;
}

/**
 * Utilidad genérica para calcular información de paginación
 * @param page - Página actual
 * @param limit - Elementos por página
 * @param totalItems - Total de elementos
 * @returns Información de paginación
 */
export function calculatePaginationInfo(
  page: number,
  limit: number,
  totalItems: number,
) {
  const totalPages = Math.ceil(totalItems / limit);

  return {
    currentPage: page,
    totalPages,
    totalItems,
    itemsPerPage: limit,
  };
}

export function simplifyZodErrors<T>(
  error: ZodError<T>,
): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  if (error.issues) {
    for (const issue of error.issues) {
      const path = issue.path.join(".");
      if (!errors[path]) {
        errors[path] = [];
      }
      errors[path].push(issue.message);
    }
  }
  return errors;
}
// Formatear iniciales del user
export function getUserInitials(
  user: Partial<UserEntity> | Omit<UserEntity, "password">,
): string {
  if (!user.name) {
    return "NN"; // Nombre no disponible
  }
  const names = user.name.trim().split(" ");
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }
  const firstInitial = names[0].charAt(0).toUpperCase();
  const lastInitial = names[names.length - 1].charAt(0).toUpperCase();
  return firstInitial + lastInitial;
}

//Funcion para formatear nombre del user
export function formatName(
  user: Partial<UserEntity> | Omit<UserEntity, "password">,
): string {
  if (!user) {
    return "No hay información del usuario";
  }
  return user.name || "No hay información del usuario";
}

interface PluralizationRule {
  test: RegExp;
  replace: string | ((match: string) => string);
}

const pluralizationRules: PluralizationRule[] = [
  { test: /ora$/i, replace: "oras" },
  { test: /ana$/i, replace: "anas" },
  { test: /ona$/i, replace: "onas" },
  { test: /esa$/i, replace: "esas" },
  { test: /ina$/i, replace: "inas" },
  { test: /iza$/i, replace: "izas" },
  { test: /triz$/i, replace: "trices" },

  { test: /or$/i, replace: "ores" },
  { test: /án$/i, replace: (match) => `${match.slice(0, -2)}anes` },
  { test: /ón$/i, replace: (match) => `${match.slice(0, -2)}ones` },
  { test: /z$/i, replace: (match) => `${match.slice(0, -1)}ces` },
  { test: /([aeiou])s$/i, replace: "$1ses" },
  { test: /([^aeiou])s$/i, replace: "$1es" },
  { test: /ís$/i, replace: "ises" },
  { test: /í$/i, replace: "íes" },
  { test: /(.)$/i, replace: "$1s" },
];

export const pluralizeItemName = (count: number, itemName: string): string => {
  if (count === 1) {
    return itemName;
  }

  const lowerItemName = itemName.toLowerCase();

  for (const rule of pluralizationRules) {
    if (rule.test.test(lowerItemName)) {
      if (typeof rule.replace === "string") {
        return itemName.replace(rule.test, rule.replace);
      }
      return rule.replace(itemName);
    }
  }

  return `${itemName}s`;
};

// Generate a unique QR code for each registration
export function generateQRCode(userId: string, eventId: string): string {
  return crypto
    .createHash("sha256")
    .update(`${userId}-${eventId}-${Date.now()}`)
    .digest("hex");
}

export function encodeInvitationData(userId: string, eventId: string): string {
  const secret = process.env.INVITATION_SECRET || "default-secret-key";
  const data = `${userId}:${eventId}`;
  const timestamp = Date.now().toString();

  // Create hash with timestamp
  const hash = crypto
    .createHmac("sha256", secret)
    .update(`${data}:${timestamp}`)
    .digest("hex");

  // Encode data + timestamp + hash together
  const payload = Buffer.from(`${data}:${timestamp}:${hash}`).toString(
    "base64url",
  );
  return payload;
}

// Decode and verify invitation data
export function decodeInvitationData(
  encodedData: string,
): { userId: string; eventId: string } | null {
  try {
    const secret = process.env.INVITATION_SECRET || "default-secret-key";
    const decoded = Buffer.from(encodedData, "base64url").toString();
    const [userId, eventId, timestamp, hash] = decoded.split(":");

    if (!userId || !eventId || !timestamp || !hash) {
      return null;
    }

    // Verify timestamp is not too old (30 days)
    const inviteTime = parseInt(timestamp, 10);
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    if (inviteTime < thirtyDaysAgo) {
      return null; // Invitation expired
    }

    // Verify hash
    const expectedHash = crypto
      .createHmac("sha256", secret)
      .update(`${userId}:${eventId}:${timestamp}`)
      .digest("hex");

    if (expectedHash !== hash) {
      return null; // Invalid hash
    }

    return { userId, eventId };
  } catch (error) {
    console.error("Error decoding invitation:", error);
    return null;
  }
}

export const generatePublicInviteToken = () => {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const segment = () =>
    Array.from({ length: 3 }, () => {
      const idx = Math.floor(Math.random() * alphabet.length);
      return alphabet[idx];
    }).join("");
  return `${segment()}-${segment()}-${segment()}`;
};

export const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "REGISTERED":
      return "emerald";
    case "PENDING":
      return "amber";
    case "WAITLISTED":
      return "sky";
    case "CANCELLED":
      return "destructive";
    case "DECLINED":
      return "slate";

    default:
      return "secondary";
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case "REGISTERED":
      return "Registrado";
    case "PENDING":
      return "Pendiente";
    case "WAITLISTED":
      return "En lista de espera";
    case "CANCELLED":
      return "Cancelado";
    case "DECLINED":
      return "Rechazado";
    case "CHECKED_IN":
      return "Entrada";

    default:
      return status;
  }
};

export const getEventStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "emerald";
    case "DRAFT":
      return "amber";
    case "CANCELLED":
      return "destructive";
    case "PUBLISHED":
      return "sky";
    case "COMPLETED":
      return "slate";
    case "ENDED":
      return "esmerald";
    default:
      return "secondary";
  }
};

export const getEventStatusLabel = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "Activo";
    case "DRAFT":
      return "Borrador";
    case "CANCELLED":
      return "Cancelado";
    case "COMPLETED":
      return "Completado";
    case "UPCOMING":
      return "Próximo";
    case "ONGOING":
      return "En curso";
    case "ENDED":
      return "Finalizado";
    default:
      return status;
  }
};

export const copyToClipboard = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copiado al portapapeles`);
  } catch {
    toast.error(`Error al copiar ${label.toLowerCase()}`);
  }
};
