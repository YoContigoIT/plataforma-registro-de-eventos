import { cn, pluralizeItemName } from "@/shared/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import React from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { Button } from "../ui/button";

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  itemName,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  itemName: string;
}) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const setPage = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", page.toString());
    navigate(`${pathname}?${newParams.toString()}`);
  };

  const goToFirst = () => setPage(1);
  const goToPrevious = () => setPage(Math.max(currentPage - 1, 1));
  const goToNext = () => setPage(Math.min(currentPage + 1, totalPages));
  const goToLast = () => setPage(totalPages);

  const [windowWidth, setWindowWidth] = React.useState<number | null>(null);

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Cambiado de 640px (sm) a 768px (md) para tablets
  const visiblePages = windowWidth !== null && windowWidth < 768 ? 3 : 5;
  const startItem =
    totalItems > 0
      ? Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)
      : 0;
  const endItem =
    totalItems > 0 ? Math.min(currentPage * itemsPerPage, totalItems) : 0;
  const renderPageNumbers = () => {
    const pages: number[] = [];

    if (totalPages > 0) pages.push(1);

    let start = Math.max(currentPage - Math.floor(visiblePages / 2), 2);
    const end = Math.min(start + visiblePages - 1, totalPages - 1);

    if (end === totalPages - 1) {
      start = Math.max(totalPages - visiblePages, 2);
    }

    if (start > 2) {
      pages.push(-1);
    }

    for (let i = start; i <= end; i++) {
      if (i > 1 && i < totalPages) pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push(-1);
    }

    if (totalPages > 1) pages.push(totalPages);

    return pages.map((pageNum) => (
      <div key={`page-${pageNum}`} className="flex items-center justify-center">
        {pageNum === -1 ? (
          <span className="px-3 py-1 text-sm text-muted-foreground">...</span>
        ) : (
          <button
            onClick={() => setPage(pageNum)}
            type="button"
            className={cn(
              "min-w-[2rem] px-3 py-1 text-sm rounded-md transition-colors",
              "hover:bg-[#6A1C32]/70  dark:hover:bg-[#BE9657]/90 hover:text-white",
              pageNum === currentPage
                ? "bg-primary text-primary-foreground font-medium shadow-sm"
                : "text-muted-foreground border  border-foreground/20"
            )}
          >
            {pageNum}
          </button>
        )}
      </div>
    ));
  };

  if (totalPages < 1) return null;

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between w-full px-4 py-3 gap-2 lg:gap-0">
      <div className="text-sm text-muted-foreground">
        {totalItems > 0 ? (
          <>
            Mostrando {startItem} a {endItem} de {totalItems}{" "}
            {pluralizeItemName(totalItems, itemName)}
          </>
        ) : (
          <>Sin resultados de {pluralizeItemName(totalItems, itemName)}</>
        )}
      </div>

      <div className="flex items-center gap-1">
        {/* Mostrar botones "primero" y "último" solo en pantallas lg+ */}
        <Button
          variant="outline"
          size="sm"
          onClick={goToFirst}
          disabled={currentPage === 1}
          className="hidden lg:flex gap-1"
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={goToPrevious}
          disabled={currentPage === 1}
          className="gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-1 mx-2">
          {renderPageNumbers()}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={goToNext}
          disabled={currentPage === totalPages}
          className="gap-1"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={goToLast}
          disabled={currentPage === totalPages}
          className="hidden lg:flex gap-1"
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
