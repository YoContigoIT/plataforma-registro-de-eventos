import { Mail, Search } from "lucide-react";
import { useId, useState } from "react";
import { FormField } from "~/shared/components/common/form-field";
import { TextInput } from "~/shared/components/common/text-input";
import { Button } from "~/shared/components/ui/button";
import { useSearchParamsManager } from "~/shared/hooks/use-search-params-manager";

interface EmailLookupProps {
  onEmailSelect: (email: string) => void;
  onClear: () => void;
  label?: string;
  selectedEmail?: string;
  isSubmitting?: boolean;
}

export function EmailLookup({
  onEmailSelect,
  onClear,
  label,
  selectedEmail,
  isSubmitting,
}: EmailLookupProps) {
  const emailId = useId();
  const { getParamValue } = useSearchParamsManager();
  const [email, setEmail] = useState(selectedEmail || "");

  const currentEmail = getParamValue("emailInput") || "";

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
  };

  const handleSearchClick = () => {
    onEmailSelect(email);
  };

  return (
    <div className="space-y-4">
      <FormField id={emailId}>
        <TextInput
          label={label || "Buscar por correo electrónico"}
          name="emailLookup"
          id={emailId}
          type="email"
          placeholder="ejemplo@correo.com"
          icon={<Mail size={20} className="text-muted-foreground" />}
          disabled={isSubmitting}
          defaultValue={currentEmail}
          onChange={handleEmailChange}
          //description="Ingresa el email del asistente para buscar o crear su registro"
        />
      </FormField>

      <Button
        type="button"
        disabled={email.trim() === ""}
        className="w-full"
        onClick={handleSearchClick}
      >
        <Search className="h-4 w-4 mr-2" />
        Continuar con este email
      </Button>
    </div>
  );
}
