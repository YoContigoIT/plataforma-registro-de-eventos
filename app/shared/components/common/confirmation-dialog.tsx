import type { ReactNode } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  icon?: ReactNode;
  variant?: "default" | "destructive";
  showTextarea?: boolean;
  textareaLabel?: string;
  textareaPlaceholder?: string;
  textareaValue?: string;
  onTextareaChange?: (value: string) => void;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  icon,
  variant = "default",
  showTextarea = false,
  textareaLabel,
  textareaPlaceholder,
  textareaValue,
  onTextareaChange,
}: ConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`w-full ${showTextarea ? 'max-w-lg' : 'max-w-md'}`}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            {icon && <div className="flex-shrink-0">{icon}</div>}
            <DialogTitle className="text-lg font-medium leading-6 text-foreground">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        {showTextarea && (
          <div className="space-y-2">
            {textareaLabel && (
              <Label htmlFor="custom-message" className="text-sm font-medium">
                {textareaLabel}
              </Label>
            )}
            <Textarea
              id="custom-message"
              placeholder={textareaPlaceholder}
              value={textareaValue}
              onChange={(e) => onTextareaChange?.(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>
        )}

        <DialogFooter className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="px-4 py-2 text-sm"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant}
            onClick={onConfirm}
            className="px-4 py-2 text-sm"
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
