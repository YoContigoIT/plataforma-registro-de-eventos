import { Button } from "@/ui/button";
import { DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { useId } from "react";
import type { FormFieldEntity } from "~/domain/entities/event-form.entity";
import { useFormBuilder } from "~/shared/hooks/use-form-builder";
import { SortableFormField } from "./sortable-form-field";

interface FormBuilderProps {
  initialFields: FormFieldEntity[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isActive?: boolean;
}

export function FormBuilder({
  initialFields,
  handleInputChange,
  isActive,
}: FormBuilderProps) {
  const {
    fields,
    expandedFields,
    hiddenInputRef,
    sensors,
    addField,
    updateField,
    removeField,
    handleDragEnd,
    toggleAdvancedOptions,
    addOption,
    updateOption,
    removeOption,
    getFieldOptions,
    getFieldValidation,
    collisionDetection,
  } = useFormBuilder({ initialFields, handleInputChange });

  console.log("isActive", isActive);

  const dndId = useId();

  return (
    <div className="space-y-6">
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
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

      {/* Hidden inputs for form submission */}
      <input
        ref={hiddenInputRef}
        type="hidden"
        name="formFields"
        defaultValue={JSON.stringify(fields)}
      />
      <input
        type="hidden"
        name="isActive"
        value={isActive?.toString() ?? "false"}
      />
    </div>
  );
}
