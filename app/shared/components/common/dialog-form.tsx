import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Form } from "react-router";
import { Button } from "~/shared/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Dialog as ShadCNDialog,
} from "~/shared/components/ui/dialog";

interface DialogProps {
  title: string;
  description: string;
  children: ReactNode;
  icon?: ReactNode;
  shouldClose?: boolean;
  onOpenChange?: (open: boolean) => void;
  size?: "default" | "large" | "xl";
  scrollable?: boolean;
}

export function DialogForm({
  title,
  description,
  children,
  icon,
  shouldClose,
  onOpenChange,
  size = "default",
  scrollable = false,
}: DialogProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (shouldClose) {
      setOpen(false);
    }
  }, [shouldClose]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <ShadCNDialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          {icon}
          {title}
        </Button>
      </DialogTrigger>
      <DialogContent size={size} className={cn(scrollable && "max-h-[90vh]")}>
        <Form
          method="post"
          replace
          className={cn(
            "space-y-4",
            scrollable && "flex flex-col max-h-[85vh]"
          )}
        >
          <DialogHeader className={scrollable ? "flex-shrink-0" : ""}>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div
            className={cn(scrollable && "flex-1 overflow-y-auto pr-2 -mr-2")}
          >
            {children}
          </div>
          <DialogFooter
            className={scrollable ? "flex-shrink-0 border-t pt-4" : ""}
          >
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit">Guardar</Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </ShadCNDialog>
  );
}
