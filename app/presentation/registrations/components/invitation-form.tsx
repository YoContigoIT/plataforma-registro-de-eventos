import { Button } from "@/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Loader2, Mail, Send, Upload } from "lucide-react";
import { useId, useState } from "react";
import { Form, Link } from "react-router";
import { toast } from "sonner";
import { sendInvitationsSchema } from "~/domain/dtos/invitation.dto";
import { FormField } from "~/shared/components/common/form-field";
import { Input } from "~/shared/components/ui/input";
import { Label } from "~/shared/components/ui/label";
import { useExcelEmailExtractor } from "~/shared/hooks/use-excel-email-extractor.hook";
import { useFormAction } from "~/shared/hooks/use-form-action.hook";
import { EmailTagsInput } from "../../events/components/forms/email-tags-input";

interface InvitationFormProps {
  eventId: string;
  eventName?: string;
}

export function InvitationForm({ eventId, eventName }: InvitationFormProps) {
  const [emails, setEmails] = useState<string[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const { isSubmitting, errors, handleInputChange } = useFormAction({
    zodSchema: sendInvitationsSchema,
  });
  const { extractEmailsFromExcel } = useExcelEmailExtractor();
  const emailsId = useId();
  const messageId = useId();
  const fileInputId = useId();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    try {
      const extractedEmails = await extractEmailsFromExcel(file);
      if (extractedEmails.length === 0) {
        toast.warning(
          "No se encontraron correos electrónicos válidos en el archivo."
        );
      } else {
        // Combinar con los correos existentes y eliminar duplicados
        const combinedEmails = [...new Set([...emails, ...extractedEmails])];
        setEmails(combinedEmails);
        toast.success(
          `Se importaron ${extractedEmails.length} correos electrónicos.`
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al procesar el archivo"
      );
    } finally {
      setIsProcessingFile(false);
      // Limpiar el input para permitir cargar el mismo archivo nuevamente
      e.target.value = "";
    }
  };

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
            <div className="space-y-2">
              <div className="flex flex-col md:flex-row items-start gap-4">
                <div className="flex-1 w-full">
                  <EmailTagsInput
                    id={emailsId}
                    name="emails"
                    label="Correos electrónicos"
                    placeholder="ejemplo@correo.com, otro@correo.com"
                    required
                    disabled={isSubmitting || isProcessingFile}
                    value={emails}
                    onChange={setEmails}
                    aria-invalid={Boolean(errors?.emails)}
                    aria-describedby={
                      errors?.emails ? "emails-error" : undefined
                    }
                  />
                </div>
                {/* <div className="w-full text-center text-muted-foreground md:hidden">
                  O también
                </div> */}
                <div className="flex flex-col gap-2 w-full md:w-auto">
                  <Label className="hidden md:inline">
                    O importar desde Excel
                  </Label>
                  <Input
                    type="file"
                    id={fileInputId}
                    className="hidden"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    disabled={isSubmitting || isProcessingFile}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      document.getElementById(fileInputId)?.click()
                    }
                    disabled={isSubmitting || isProcessingFile}
                    className="whitespace-nowrap"
                  >
                    {isProcessingFile ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        <span className="hidden sm:inline">Procesando...</span>
                        <span className="md:hidden">...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">
                          Seleccionar archivo
                        </span>
                        <span className="md:hidden">Importar desde Excel</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Formatos soportados: .xlsx, .xls
              </p>
            </div>
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
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
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
