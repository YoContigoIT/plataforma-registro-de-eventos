import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Label } from "@/ui/label";
import { Switch } from "@/ui/switch";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { FormFieldType } from "@prisma/client";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";
import type { FormFieldEntity } from "~/domain/entities/event-form.entity";
import { SelectInput } from "~/shared/components/common/select-input";
import { TextInput } from "~/shared/components/common/text-input";

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

interface SortableFormFieldProps {
  field: FormFieldEntity;
  index: number;
  isExpanded: boolean;
  updateField: (index: number, updates: Partial<FormFieldEntity>) => void;
  removeField: (index: number) => void;
  toggleAdvancedOptions: (fieldId: string) => void;
  getFieldValidation: (field: FormFieldEntity) => Record<string, any>;
  getFieldOptions: (field: FormFieldEntity) => string[];
  addOption: (fieldIndex: number) => void;
  updateOption: (
    fieldIndex: number,
    optionIndex: number,
    value: string
  ) => void;
  removeOption: (fieldIndex: number, optionIndex: number) => void;
}

export function SortableFormField({
  field,
  index,
  isExpanded,
  updateField,
  removeField,
  toggleAdvancedOptions,
  getFieldValidation,
  getFieldOptions,
  addOption,
  updateOption,
  removeOption,
}: SortableFormFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="border border-input relative"
    >
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={() => removeField(index)}
        className="absolute top-4 right-4 z-10"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div
            {...attributes}
            {...listeners}
            className="mt-2 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="size-5 text-muted-foreground" />
          </div>

          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-1">
                <TextInput
                  label="Etiqueta del campo"
                  id={`label-${index}`}
                  defaultValue={field.label}
                  onBlur={(e) =>
                    updateField(index, {
                      label: e.target.value,
                    })
                  }
                  placeholder="Ej: Nombre completo"
                />
              </div>
              <div className="md:col-span-1">
                <SelectInput
                  label="Tipo de campo"
                  options={fieldTypeOptions}
                  defaultValue={field.type}
                  onValueChange={(value) =>
                    updateField(index, {
                      type: value as FormFieldType,
                    })
                  }
                />
              </div>
              <div className="md:col-span-1 items-center justify-start space-y-2">
                <Label htmlFor={`required-${index}`} className="text-sm">
                  Campo obligatorio
                </Label>
                <Switch
                  id={`required-${index}`}
                  defaultChecked={field.required}
                  onCheckedChange={(checked) =>
                    updateField(index, {
                      required: checked,
                    })
                  }
                />
              </div>
            </div>

            {/* Advanced Options Toggle */}
            <div className="w-full flex justify-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => toggleAdvancedOptions(field.id)}
                className="p-0 h-auto font-normal text-sm text-muted-foreground hover:text-foreground"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 mr-1" />
                ) : (
                  <ChevronDown className="h-4 w-4 mr-1" />
                )}
                Mostrar opciones avanzadas
              </Button>
            </div>

            {/* Advanced Configuration */}
            {isExpanded && (
              <div className="space-y-4 pt-2 border-t border-border">
                {/* Placeholder */}
                <div>
                  <TextInput
                    label="Texto de ayuda"
                    id={`placeholder-${index}`}
                    defaultValue={field.placeholder || ""}
                    onBlur={(e) =>
                      updateField(index, {
                        placeholder: e.target.value || null,
                      })
                    }
                    placeholder="Texto de ayuda para el usuario"
                  />
                </div>

                {["TEXT", "TEXTAREA", "EMAIL", "PHONE"].includes(
                  field.type
                ) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <TextInput
                        label="Longitud mínima"
                        id={`minLength-${index}`}
                        type="number"
                        defaultValue={getFieldValidation(field).minLength || ""}
                        onBlur={(e) => {
                          const currentValidation = getFieldValidation(field);
                          updateField(index, {
                            validation: {
                              ...currentValidation,
                              minLength: e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            },
                          });
                        }}
                        placeholder="Ej: 2"
                      />
                    </div>
                    <div>
                      <TextInput
                        label="Longitud máxima"
                        id={`maxLength-${index}`}
                        type="number"
                        defaultValue={getFieldValidation(field).maxLength || ""}
                        onBlur={(e) => {
                          const currentValidation = getFieldValidation(field);
                          updateField(index, {
                            validation: {
                              ...currentValidation,
                              maxLength: e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            },
                          });
                        }}
                        placeholder="Ej: 100"
                      />
                    </div>
                  </div>
                )}

                {/* Options for select/radio/checkbox */}
                {["SELECT", "RADIO", "CHECKBOX"].includes(field.type) && (
                  <div>
                    <Label className="mb-1">Opciones</Label>
                    <div className="space-y-2 mt-2">
                      {getFieldOptions(field).map((option, optionIndex) => (
                        <div
                          key={`${field.id}-option-${optionIndex}`}
                          className="flex gap-2"
                        >
                          <TextInput
                            defaultValue={option}
                            onBlur={(e) =>
                              updateOption(index, optionIndex, e.target.value)
                            }
                            placeholder={`Opción ${optionIndex + 1}`}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeOption(index, optionIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addOption(index)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar opción
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
