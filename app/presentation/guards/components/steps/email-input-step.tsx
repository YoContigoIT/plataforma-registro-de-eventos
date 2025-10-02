import { RefreshCcwDotIcon } from "lucide-react";
import type { EventEntityWithEventForm } from "~/domain/entities/event.entity";
import { PageHeader } from "~/shared/components/common/page-header";
import { Button } from "~/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/shared/components/ui/card";
import { EmailLookup } from "../email-lookup";

interface EmailInputStepProps {
  selectedEvent: EventEntityWithEventForm;
  selectedEmail?: string;
  onEmailSelect: (email: string) => void;
  onClearEmail: () => void;
  onClearEvent: () => void;
  isSubmitting: boolean;
  title?: string;
  description?: string;
}

export function EmailInputStep({
  selectedEvent,
  selectedEmail,
  onEmailSelect,
  onClearEmail,
  onClearEvent,
  isSubmitting,
  title,
  description,
}: EmailInputStepProps) {
  const defaultTitle = title || `Ingresar email para ${selectedEvent.name}`;
  const defaultDescription =
    description || "Ingresa el correo electrónico para continuar";

  return (
    <div>
      <PageHeader
        title={defaultTitle}
        description={defaultDescription}
        actions={
          <Button variant="outline" size="sm" onClick={onClearEvent}>
            <RefreshCcwDotIcon className="h-4 w-4 mr-2" />
            Cambiar evento
          </Button>
        }
      />

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Correo electrónico</CardTitle>
        </CardHeader>
        <CardContent>
          <EmailLookup
            onEmailSelect={onEmailSelect}
            onClear={onClearEmail}
            selectedEmail={selectedEmail}
            isSubmitting={isSubmitting}
            label="Correo electrónico"
          />
        </CardContent>
      </Card>
    </div>
  );
}
