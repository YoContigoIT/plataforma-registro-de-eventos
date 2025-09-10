import { Temporal } from "@js-temporal/polyfill";
import { type ClassValue, clsx } from "clsx";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { twMerge } from "tailwind-merge";
import type { ZodError } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
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
        // Para búsquedas directas
        condition[searchField.field] = {
          contains: searchTerm,
          mode: searchField.mode || "insensitive",
        };
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


export function simplifyZodErrors<T>(error: ZodError<T>): Record<string, string[]> {
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
