import {
  closestCenter,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import type { FormFieldType } from "@prisma/client";
import { useEffect, useRef, useState } from "react";
import type { FormFieldEntity } from "~/domain/entities/event-form.entity";

interface UseFormBuilderProps {
  initialFields: FormFieldEntity[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function useFormBuilder({ initialFields, handleInputChange }: UseFormBuilderProps) {
  const [fields, setFields] = useState<FormFieldEntity[]>(initialFields);
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());
  const [isClient, setIsClient] = useState(false);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Ensure we're on the client side to avoid hydration mismatches
  useEffect(() => {
    setIsClient(true);
  }, []);

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

  return {
    // State
    fields,
    expandedFields,
    isClient,
    hiddenInputRef,
    sensors,
    
    // Actions
    addField,
    updateField,
    removeField,
    handleDragEnd,
    toggleAdvancedOptions,
    addOption,
    updateOption,
    removeOption,
    
    // Helpers
    getFieldOptions,
    getFieldValidation,
    
    // Constants
    collisionDetection: closestCenter,
  };
}