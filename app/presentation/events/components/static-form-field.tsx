import { Card, CardContent } from "@/ui/card";
import { GripVertical } from "lucide-react";
import type { FormFieldEntity } from "~/domain/entities/event-form.entity";

const fieldTypeOptions = [
  { value: "TEXT", label: "Texto" },
  { value: "EMAIL", label: "Correo electrónico" },
  { value: "PHONE", label: "Teléfono" },
  { value: "NUMBER", label: "Número" },
  { value: "TEXTAREA", label: "Área de texto" },
  { value: "SELECT", label: "Selección" },
  { value: "RADIO", label: "Opción única" },
  { value: "CHECKBOX", label: "Opción múltiple" },
  { value: "DATE", label: "Fecha" },
  { value: "TIME", label: "Hora" },
];

interface StaticFormFieldProps {
  field: FormFieldEntity;
  index: number;
}

export function StaticFormField({ field, index }: StaticFormFieldProps) {
  return (
    <Card className="border border-input relative">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="mt-2">
            <GripVertical className="size-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {field.label || `Campo ${index + 1}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {fieldTypeOptions.find((opt) => opt.value === field.type)
                    ?.label || field.type}
                  {field.required && " (Requerido)"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
