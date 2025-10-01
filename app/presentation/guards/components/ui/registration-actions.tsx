import { RefreshCcwDotIcon, UserSearch } from "lucide-react";
import type { RegistrationWithFullRelations } from "~/domain/entities/registration.entity";
import { Button } from "~/shared/components/ui/button";

interface RegistrationActionsProps {
  registration?: RegistrationWithFullRelations;
  onClearEmail: () => void;
  onClearEvent: () => void;
  actionType?: "create" | "update";
}

export function RegistrationActions({
  onClearEmail,
  onClearEvent,
  actionType = "create",
}: RegistrationActionsProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onClearEmail}>
          <UserSearch className="h-4 w-4 mr-2" />
          {actionType === "create" ? "Buscar otro email" : "Cambiar email"}
        </Button>
        <Button variant="outline" size="sm" onClick={onClearEvent}>
          <RefreshCcwDotIcon className="h-4 w-4 mr-2" />
          Cambiar evento
        </Button>
      </div>
    </div>
  );
}
