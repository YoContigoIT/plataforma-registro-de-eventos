import { Button } from "@/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Mail, Send } from "lucide-react";
import { useId, useState } from "react";
import { Form, Link } from "react-router";
import { sendInvitationsSchema } from "~/domain/dtos/invitation.dto";
import { FormField } from "~/shared/components/common/form-field";
import { useFormAction } from "~/shared/hooks/use-form-action.hook";
import { EmailTagsInput } from "./email-tags-input";

interface InvitationFormProps {
  eventId: string;
  eventName?: string;
}

export function InvitationForm({ eventId, eventName }: InvitationFormProps) {
  const [emails, setEmails] = useState<string[]>([]);
  const { isSubmitting, errors, handleInputChange } = useFormAction({
    zodSchema: sendInvitationsSchema,
  });
  const emailsId = useId();
  const messageId = useId();

  return (
    <Form method="POST" replace className="space-y-6">
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Enviar invitaciones
            {eventName && (
              <span className="text-muted-foreground font-normal">
                - {eventName}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Hidden eventId field */}
          <input type="hidden" name="eventId" value={eventId} />

          <FormField id={emailsId} error={errors.emails}>
            <EmailTagsInput
              id={emailsId}
              name="emails"
              label="Correos electrónicos"
              placeholder="ejemplo@correo.com, otro@correo.com"
              required
              disabled={isSubmitting}
              value={emails}
              onChange={setEmails}
              aria-invalid={Boolean(errors?.emails)}
              aria-describedby={errors?.emails ? "emails-error" : undefined}
            />
          </FormField>

          {/* Custom message */}
          <FormField id={messageId} error={errors.message}>
            <div className="space-y-1.5">
              <label htmlFor={messageId} className="text-sm font-medium">
                Mensaje personalizado
              </label>
              <textarea
                id={messageId}
                name="message"
                className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Mensaje adicional para incluir en la invitación (opcional)"
                maxLength={500}
                onChange={handleInputChange}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors?.message)}
                aria-describedby={errors?.message ? "message-error" : undefined}
              />
              <p className="text-xs text-muted-foreground">
                Máximo 500 caracteres
              </p>
            </div>
          </FormField>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4 border-t p-6">
          <Button variant="outline" asChild>
            <Link to={`/registros?eventId=${eventId}`}>Cancelar</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              "Enviando..."
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar invitaciones
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </Form>
  );
}
