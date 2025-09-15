import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { useSearchParams } from "react-router";
import { useDebouncedCallback } from "use-debounce";
import { Button } from "~/shared/components/ui/button";
import { Input } from "~/shared/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/shared/components/ui/table";

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  searchColumn?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  entityName?: string;
  // Props para búsqueda en servidor
  pagination?: PaginationInfo;
  isLoading?: boolean;
  serverSearch?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Buscar...",
  searchColumn = "nombre",
  emptyStateTitle = "No hay datos",
  emptyStateDescription = "No se encontraron datos que coincidan con tu búsqueda.",
  entityName = "elemento",
  pagination,
  isLoading = false,
  serverSearch = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(
    serverSearch ? searchParams.get("search") || "" : ""
  );

  // Debounced search para búsqueda en servidor
  const debouncedSearch = useDebouncedCallback((value: string) => {
    if (!serverSearch) return;
    const newSearchParams = new URLSearchParams(searchParams);
    if (value) {
      newSearchParams.set("search", value);
    } else {
      newSearchParams.delete("search");
    }
    newSearchParams.set("page", "1");
    setSearchParams(newSearchParams);
  }, 500);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: serverSearch ? undefined : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: serverSearch ? undefined : getFilteredRowModel(),
    manualPagination: serverSearch,
    pageCount: serverSearch ? pagination?.totalPages : undefined,
    state: {
      sorting,
      columnFilters,
    },
  });

  // Manejar cambios en el input de búsqueda
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (serverSearch) {
      setSearchValue(value);
      debouncedSearch(value);
    } else {
      table.getColumn(searchColumn)?.setFilterValue(value);
    }
  };

  // Manejar cambios de página para búsqueda en servidor
  const handlePageChange = (newPage: number) => {
    if (!serverSearch) return;
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", newPage.toString());
    setSearchParams(newSearchParams);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Input
          placeholder={searchPlaceholder}
          value={
            serverSearch
              ? searchValue
              : ((table.getColumn(searchColumn)?.getFilterValue() as string) ??
                "")
          }
          onChange={handleSearchChange}
          className="max-w-sm"
          disabled={isLoading}
        />
        <div className="text-sm text-muted-foreground">
          {serverSearch
            ? `${pagination?.totalItems || 0} ${entityName}(s) encontrado(s)`
            : `${table.getFilteredRowModel().rows.length} ${entityName}(s) encontrado(s)`}
        </div>
      </div>

      <div className="bg-card rounded-xl border">
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b bg-muted/50">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className="font-semibold text-foreground"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow
                    key={index}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    {columns.map((_, colIndex) => (
                      <TableCell key={colIndex} className="py-4">
                        <div className="h-4 bg-muted animate-pulse rounded" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center"
                  >
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <div className="text-lg font-medium mb-1">
                        {emptyStateTitle}
                      </div>
                      <div className="text-sm">{emptyStateDescription}</div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/50 rounded-b-xl">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            {serverSearch && pagination ? (
              <>
                Mostrando{" "}
                {pagination.totalItems > 0
                  ? (pagination.currentPage - 1) * pagination.itemsPerPage + 1
                  : 0}{" "}
                a{" "}
                {Math.min(
                  pagination.currentPage * pagination.itemsPerPage,
                  pagination.totalItems
                )}{" "}
                de {pagination.totalItems} resultados
              </>
            ) : (
              <>
                Mostrando{" "}
                {table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                  1}{" "}
                a{" "}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )}{" "}
                de {table.getFilteredRowModel().rows.length} resultados
              </>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (serverSearch && pagination) {
                handlePageChange(pagination.currentPage - 1);
              } else {
                table.previousPage();
              }
            }}
            disabled={
              serverSearch && pagination
                ? pagination.currentPage <= 1 || isLoading
                : !table.getCanPreviousPage()
            }
            className="text-sm"
          >
            Anterior
          </Button>
          <div className="flex items-center space-x-1">
            <span className="text-sm text-muted-foreground">
              {serverSearch && pagination
                ? `Página ${pagination.currentPage} de ${pagination.totalPages}`
                : `Página ${table.getState().pagination.pageIndex + 1} de ${table.getPageCount()}`}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (serverSearch && pagination) {
                handlePageChange(pagination.currentPage + 1);
              } else {
                table.nextPage();
              }
            }}
            disabled={
              serverSearch && pagination
                ? pagination.currentPage >= pagination.totalPages || isLoading
                : !table.getCanNextPage()
            }
            className="text-sm"
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
