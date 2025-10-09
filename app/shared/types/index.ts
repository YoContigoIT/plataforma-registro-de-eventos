export interface ActionData {
  success?: boolean;
  error?: string;
  message?: string;
  redirectTo?: string;
  errors?: Record<string, string[]>;
}

export interface LoaderData<T> {
  success: boolean;
  data?: T | null;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface SortState {
  column: string | null;
  direction: "asc" | "desc" | null;
}

export interface SortOptions {
  sortBy: string;
  sortDirection: "asc" | "desc";
}

export type TokenClassification =
  | { type: "private"; payload: { userId: string; eventId: string } }
  | { type: "public" };