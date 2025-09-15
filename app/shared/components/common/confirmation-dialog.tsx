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
}: ConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md">
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
