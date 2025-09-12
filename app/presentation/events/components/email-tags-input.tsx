import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import * as React from "react";

interface EmailTag {
  id: string;
  value: string;
}

interface EmailTagsInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange"
  > {
  label?: string;
  value?: string[];
  onChange?: (emails: string[]) => void;
  onBlur?: (e: React.FocusEvent<HTMLDivElement>) => void;
}

const EmailTagsInput = React.forwardRef<HTMLDivElement, EmailTagsInputProps>(
  (
    {
      className,
      label,
      value = [],
      onChange,
      onBlur,
      placeholder,
      disabled,
      required,
      id,
      name,
      ...props
    },
    ref
  ) => {
    const [inputValue, setInputValue] = React.useState("");
    const [tags, setTags] = React.useState<EmailTag[]>([]);
    const [focusedtagIndex, setFocusedtagIndex] = React.useState<number | null>(
      null
    );
    const inputRef = React.useRef<HTMLInputElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Convert value prop to tags
    React.useEffect(() => {
      console.log("bruh");
      const newTags: EmailTag[] = value
        .map((email, index) => ({
          id: `tag-${index}-${email}`,
          value: email.trim(),
        }))
        .filter((tag) => tag.value);
      setTags(newTags);
    }, [value]);

    // Parse comma-separated input into tags
    const parseInput = (input: string) => {
      const emails = input
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email);
      return emails;
    };

    const addTags = (emails: string[]) => {
      const newTags = emails.map((email, index) => ({
        id: `tag-${Date.now()}-${index}`,
        value: email,
      }));

      const updatedTags = [...tags, ...newTags];
      setTags(updatedTags);
      onChange?.(updatedTags.map((tag) => tag.value));
    };

    const removetag = (tagId: string) => {
      const updatedTags = tags.filter((tag) => tag.id !== tagId);
      setTags(updatedTags);
      onChange?.(updatedTags.map((tag) => tag.value));
      inputRef.current?.focus();
    };

    const removeLastTag = () => {
      if (tags.length > 0) {
        const updatedTags = tags.slice(0, -1);
        setTags(updatedTags);
        onChange?.(updatedTags.map((tag) => tag.value));
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      if (value.includes(",")) {
        const emails = parseInput(value);
        if (emails.length > 0) {
          addTags(emails);
          setInputValue("");
        }
      } else {
        setInputValue(value);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        if (inputValue.trim()) {
          addTags([inputValue.trim()]);
          setInputValue("");
        }
      } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
        removeLastTag();
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData("text");
      const emails = parseInput(pastedText);
      if (emails.length > 0) {
        addTags(emails);
        setInputValue("");
      }
    };

    const handleContainerClick = () => {
      inputRef.current?.focus();
    };

    const handleTagKeyDown = (
      e: React.KeyboardEvent<HTMLButtonElement>,
      tagId: string,
      index: number
    ) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        removetag(tagId);
        if (index < tags.length - 1) {
          setFocusedtagIndex(index);
        } else if (index > 0) {
          setFocusedtagIndex(index - 1);
        } else {
          setFocusedtagIndex(null);
          inputRef.current?.focus();
        }
      } else if (e.key === "ArrowLeft" && index > 0) {
        setFocusedtagIndex(index - 1);
      } else if (e.key === "ArrowRight" && index < tags.length - 1) {
        setFocusedtagIndex(index + 1);
      } else if (e.key === "ArrowRight" && index === tags.length - 1) {
        setFocusedtagIndex(null);
        inputRef.current?.focus();
      }
    };

    // Focus management for tags
    React.useEffect(() => {
      if (focusedtagIndex !== null && containerRef.current) {
        const tagButton = containerRef.current.querySelector(
          `[data-tag-index="${focusedtagIndex}"]`
        ) as HTMLButtonElement;
        tagButton?.focus();
      }
    }, [focusedtagIndex]);

    return (
      <div className="space-y-2">
        {label && (
          <Label
            htmlFor={id}
            className={
              required
                ? "after:content-['*'] after:text-destructive after:ml-1"
                : ""
            }
          >
            {label}
          </Label>
        )}
        <div
          ref={containerRef}
          className={cn(
            "min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
            "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
            "cursor-text transition-colors",
            disabled && "cursor-not-allowed opacity-50",
            className
          )}
          onClick={handleContainerClick}
          onBlur={onBlur}
        >
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <div
                key={tag.id}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md bg-tag px-2 py-1 text-xs font-medium text-tag-foreground",
                  "transition-colors duration-200",
                  "hover:bg-tag-hover",
                  "focus-within:bg-tag-hover focus-within:ring-2 focus-within:ring-tag-focus focus-within:ring-offset-1"
                )}
              >
                <span className="max-w-xs truncate">{tag.value}</span>
                <button
                  type="button"
                  data-tag-index={index}
                  className={cn(
                    "inline-flex h-4 w-4 items-center justify-center rounded-sm",
                    "hover:bg-tag-foreground/20 focus:outline-none focus:ring-1 focus:ring-tag-focus",
                    "transition-colors duration-200"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    removetag(tag.id);
                  }}
                  onKeyDown={(e) => handleTagKeyDown(e, tag.id, index)}
                  disabled={disabled}
                  aria-label={`Remove ${tag.value}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder={tags.length === 0 ? placeholder : ""}
              disabled={disabled}
              className={cn(
                "flex-1 bg-transparent outline-none placeholder:text-muted-foreground",
                "min-w-[120px]",
                disabled && "cursor-not-allowed"
              )}
              aria-describedby={props["aria-describedby"]}
              aria-invalid={props["aria-invalid"]}
              {...props}
            />
          </div>
        </div>
        {/* Hidden input for form submission */}
        <input
          type="hidden"
          name={name}
          value={tags.map((tag) => tag.value).join(",")}
        />
      </div>
    );
  }
);

EmailTagsInput.displayName = "EmailTagsInput";

export { EmailTagsInput };
