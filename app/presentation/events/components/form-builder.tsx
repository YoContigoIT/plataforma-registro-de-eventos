import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Label } from "@/ui/label";
import { Switch } from "@/ui/switch";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { FormFieldType } from "@prisma/client";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { FormFieldEntity } from "~/domain/entities/event-form.entity";
import { SelectInput } from "~/shared/components/common/select-input";
import { TextInput } from "~/shared/components/common/text-input";

interface FormBuilderProps {
  initialFields: FormFieldEntity[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const fieldTypeOptions: { value: FormFieldType; label: string }[] = [
  { value: "TEXT", label: "Texto" },
  { value: "EMAIL", label: "Correo electrónico" },
  { value: "PHONE", label: "Teléfono" },
  { value: "NUMBER", label: "Número" },
  { value: "TEXTAREA", label: "Área de texto" },
  { value: "SELECT", label: "Selección" },
  { value: "RADIO", label: "Opción única" },
  { value: "CHECKBOX", label: "Opción múltiple" },
  { value: "DATE", label: "Fecha" },
];

// Sortable field component
function SortableFormField({
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
}: {
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
}) {
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

// Static field component for server-side rendering
function StaticFormField({
  field,
  index,
}: {
  field: FormFieldEntity;
  index: number;
}) {
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

export function FormBuilder({
  initialFields,
  handleInputChange,
}: FormBuilderProps) {
  const [fields, setFields] = useState<FormFieldEntity[]>(initialFields);
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());
  const [isClient, setIsClient] = useState(false);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Ensure we're on the client side to avoid hydration mismatches
  useEffect(() => {
    setIsClient(true);
  }, []);

  const dndId = useId();

  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = JSON.stringify(fields);
      handleInputChange({
        target: hiddenInputRef.current,
      } as React.ChangeEvent<HTMLInputElement>);
    }
  }, [fields, handleInputChange]);

  const addField = () => {
    const newField: FormFieldEntity = {
      id: `new-field-${Date.now()}`,
      formId: "",
      label: "",
      type: "TEXT" as FormFieldType,
      required: false,
      placeholder: null,
      options: null,
      validation: null,
      order: fields.length,
    };
    setFields([...fields, newField]);
  };

  const updateField = (index: number, updates: Partial<FormFieldEntity>) => {
    const updatedFields = fields.map((field, i) =>
      i === index ? { ...field, ...updates } : field
    );
    setFields(updatedFields);

    if (
      updates.type &&
      ["SELECT", "RADIO", "CHECKBOX"].includes(updates.type)
    ) {
      const fieldId = fields[index].id;
      setExpandedFields((prev) => new Set([...prev, fieldId]));
    }
  };

  const removeField = (index: number) => {
    const updatedFields = fields
      .filter((_, i) => i !== index)
      .map((field, i) => ({ ...field, order: i }));
    setFields(updatedFields);
  };

  // Replace handleDragEnd with dnd-kit version
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        const reorderedFields = arrayMove(items, oldIndex, newIndex);
        return reorderedFields.map((field, index) => ({
          ...field,
          order: index,
        }));
      });
    }
  }

  const toggleAdvancedOptions = (fieldId: string) => {
    const newExpanded = new Set(expandedFields);
    if (newExpanded.has(fieldId)) {
      newExpanded.delete(fieldId);
    } else {
      newExpanded.add(fieldId);
    }
    setExpandedFields(newExpanded);
  };

  const addOption = (fieldIndex: number) => {
    const field = fields[fieldIndex];
    const currentOptions = Array.isArray(field.options)
      ? (field.options as string[])
      : [];
    updateField(fieldIndex, { options: [...currentOptions, ""] });
  };

  const updateOption = (
    fieldIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const field = fields[fieldIndex];
    const currentOptions = Array.isArray(field.options)
      ? (field.options as string[])
      : [];
    const options = [...currentOptions];
    options[optionIndex] = value;
    updateField(fieldIndex, { options });
  };

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    const field = fields[fieldIndex];
    const currentOptions = Array.isArray(field.options)
      ? (field.options as string[])
      : [];
    const options = currentOptions.filter((_, i) => i !== optionIndex);
    updateField(fieldIndex, { options });
  };

  const getFieldOptions = (field: FormFieldEntity): string[] => {
    return Array.isArray(field.options) ? (field.options as string[]) : [];
  };

  const getFieldValidation = (field: FormFieldEntity): Record<string, any> => {
    return field.validation &&
      typeof field.validation === "object" &&
      !Array.isArray(field.validation)
      ? (field.validation as Record<string, any>)
      : {};
  };

  // Render static version on server, interactive version on client
  if (!isClient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Formulario de registro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {fields.map((field, index) => (
              <StaticFormField key={field.id} field={field} index={index} />
            ))}
          </div>

          <Button type="button" variant="outline" className="w-full" disabled>
            <Plus className="h-4 w-4 mr-2" />
            Agregar campo
          </Button>

          {/* Hidden input for form submission */}
          <input
            ref={hiddenInputRef}
            type="hidden"
            name="formFields"
            defaultValue={JSON.stringify(fields)}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Formulario de registro</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          id={dndId}
        >
          <SortableContext
            items={fields.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {fields.map((field, index) => {
                const isExpanded = expandedFields.has(field.id);
                return (
                  <SortableFormField
                    key={field.id}
                    field={field}
                    index={index}
                    isExpanded={isExpanded}
                    updateField={updateField}
                    removeField={removeField}
                    toggleAdvancedOptions={toggleAdvancedOptions}
                    getFieldValidation={getFieldValidation}
                    getFieldOptions={getFieldOptions}
                    addOption={addOption}
                    updateOption={updateOption}
                    removeOption={removeOption}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>

        <Button
          type="button"
          variant="outline"
          onClick={addField}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar campo
        </Button>

        {/* Hidden input for form submission - uses correct field name from DTO */}
        <input
          ref={hiddenInputRef}
          type="hidden"
          name="formFields"
          defaultValue={JSON.stringify(fields)}
        />
      </CardContent>
    </Card>
  );
}
