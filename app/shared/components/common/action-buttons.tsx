import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CreditCard,
  Download,
  Eye,
  FilePen,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Link, useFetcher } from "react-router";
import { ConfirmationDialog } from "~/shared/components/common/confirmation-dialog";
import { Button } from "~/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/shared/components/ui/dropdown-menu";

interface ActionButtonsProps {
  viewUrl?: string;
  editUrl?: string;
  paymentUrl?: string;
  deleteAction?: string;
  deleteId?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  canPay?: boolean;
  canExport?: boolean;
  exportAction?: string;
  exportId?: string;
  deleteTitle?: string;
  deleteDescription?: string;
  variant?: "inline" | "dropdown";
  size?: "sm" | "md";
}

export function ActionButtons({
  viewUrl,
  editUrl,
  paymentUrl,
  deleteAction,
  deleteId,
  canEdit = false,
  canDelete = false,
  canPay = false,
  canExport = false,
  exportAction,
  exportId,
  deleteTitle = "Eliminar elemento",
  deleteDescription = "¿Estás seguro de que quieres eliminar este elemento? Esta acción no se puede deshacer.",
  variant = "inline",
  size = "sm",
}: ActionButtonsProps) {
  const fetcher = useFetcher();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleDeleteClick = () => {
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteAction && deleteId) {
      fetcher.submit(
        { id: deleteId },
        {
          action: deleteAction,
          method: "post",
        }
      );
    }
    setIsDialogOpen(false);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const buttonSize = size === "sm" ? "sm" : "default";
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  const handleExportClick = async () => {
    if (!exportAction || !exportId) return;

    setIsExporting(true);
    try {
      const formData = new FormData();
      formData.append("exportType", "single");

      // Determinar el nombre del parámetro según la acción de exportado
      const paramName = exportAction.includes("/nominas/") ? "payrollId" : "id";
      formData.append(paramName, exportId);

      const response = await fetch(exportAction, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al exportar");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "nomina.xlsx";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/i);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al exportar:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Contar acciones para el dropdown (excluyendo pago y exportar)
  const dropdownActions = [
    viewUrl,
    canEdit && editUrl,
    canDelete && deleteAction,
  ].filter(Boolean);

  // Determinar si necesitamos dropdown para las acciones restantes
  const needsDropdown = variant === "dropdown" || dropdownActions.length > 2;

  return (
    <>
      <div className="flex items-center gap-1">
        {/* Botones de pago y exportar siempre fuera del dropdown */}
        {canPay && paymentUrl && (
          <Button
            variant="ghost"
            size={buttonSize}
            asChild
            className="hover:bg-accent/50"
          >
            <Link to={paymentUrl}>
              <CreditCard
                className={cn(
                  iconSize,
                  "text-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                )}
              />
              <span className="sr-only">Procesar pago</span>
            </Link>
          </Button>
        )}
        {canExport && exportAction && (
          <Button
            variant="ghost"
            size={buttonSize}
            onClick={handleExportClick}
            disabled={isExporting}
            className="hover:bg-accent/50"
          >
            <Download
              className={cn(
                iconSize,
                "text-orange-600 hover:text-orange-700 dark:hover:text-orange-400 transition-colors"
              )}
            />
            <span className="sr-only">
              {isExporting ? "Exportando..." : "Exportar Excel"}
            </span>
          </Button>
        )}

        {/* Dropdown para las demás acciones si es necesario */}
        {needsDropdown && dropdownActions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              {viewUrl && (
                <DropdownMenuItem asChild>
                  <Link to={viewUrl}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver detalles
                  </Link>
                </DropdownMenuItem>
              )}
              {canEdit && editUrl && (
                <DropdownMenuItem asChild>
                  <Link to={editUrl}>
                    <FilePen className="mr-2 h-4 w-4" />
                    Editar
                  </Link>
                </DropdownMenuItem>
              )}
              {canDelete && deleteAction && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={handleDeleteClick}
                    disabled={fetcher.state === "submitting"}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {fetcher.state === "submitting"
                      ? "Eliminando..."
                      : "Eliminar"}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Botones inline para pocas acciones cuando no se necesita dropdown */}
        {!needsDropdown && (
          <>
            {viewUrl && (
              <Button
                variant="ghost"
                size={buttonSize}
                asChild
                className="hover:bg-accent/50"
              >
                <Link to={viewUrl}>
                  <Eye
                    className={cn(
                      iconSize,
                      "text-muted-foreground hover:text-primary transition-colors"
                    )}
                  />
                  <span className="sr-only">Ver detalles</span>
                </Link>
              </Button>
            )}
            {canEdit && editUrl && (
              <Button
                variant="ghost"
                size={buttonSize}
                asChild
                className="hover:bg-accent/50"
              >
                <Link to={editUrl}>
                  <FilePen
                    className={cn(
                      iconSize,
                      "text-sky-600 hover:text-sky-700 dark:hover:text-sky-400 transition-colors"
                    )}
                  />
                  <span className="sr-only">Editar</span>
                </Link>
              </Button>
            )}
            {canDelete && deleteAction && (
              <Button
                variant="ghost"
                size={buttonSize}
                onClick={handleDeleteClick}
                disabled={fetcher.state === "submitting"}
                className="hover:bg-destructive/10 dark:hover:bg-destructive/20"
              >
                <Trash2
                  className={cn(
                    iconSize,
                    "text-destructive hover:text-destructive/80 transition-colors"
                  )}
                />
                <span className="sr-only">
                  {fetcher.state === "submitting"
                    ? "Eliminando..."
                    : "Eliminar"}
                </span>
              </Button>
            )}
          </>
        )}
      </div>

      <ConfirmationDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmDelete}
        title={deleteTitle}
        description={deleteDescription}
        confirmText="Eliminar"
        cancelText="Cancelar"
        icon={<AlertTriangle className="h-6 w-6 text-destructive" />}
        variant="destructive"
      />
    </>
  );
}
