import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter } from "lucide-react";
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { toast } from "sonner";
import { ConfirmationDialog } from "~/shared/components/common/confirmation-dialog";

interface MassActionsProps {
  selectedRegistrations: string[];
  onLoadingChange?: (loading: boolean) => void;
}
export function MassActions({
  selectedRegistrations,
  onLoadingChange,
}: MassActionsProps) {
  const fetcher = useFetcher();
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);
  const isLoading = fetcher.state === "submitting";

  useEffect(() => {
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      toast[fetcher.data.success ? "success" : "error"](
        fetcher.data.success
          ? fetcher.data.message || "Registros revocados correctamente"
          : fetcher.data.error || "Error al revocar el registro"
      );
    }
  }, [fetcher.state, fetcher.data]);

  const handleRevoke = () => {
    fetcher.submit(
      {
        registrationIds: selectedRegistrations.join(","),
      },
      {
        action: "/registros/delete-registration",
        method: "post",
      }
    );
    setIsRevokeDialogOpen(false);
  };
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="size-5 mr-2" />
            Acciones masivas
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsRevokeDialogOpen(true)}>
            Revocar invitaciones
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmationDialog
        isOpen={isRevokeDialogOpen}
        onClose={() => {
          setIsRevokeDialogOpen(false);
        }}
        onConfirm={handleRevoke}
        title="Revocar invitación"
        description={`¿Estás seguro de que quieres revocar las invitaciones seleccionadas? Esta acción eliminará el registro y permitirá enviar una nueva invitación.`}
        confirmText="Revocar invitación"
        cancelText="Cancelar"
        variant="destructive"
      />
    </>
  );
}
