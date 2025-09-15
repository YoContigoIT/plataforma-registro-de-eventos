import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/shared/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive backdrop-blur-[20px] shadow-sm",
  {
    variants: {
      variant: {
        default:
          "bg-primary/90 text-primary-foreground hover:bg-primary/85 shadow-primary/20",
        destructive:
          "bg-destructive/90 text-white hover:bg-destructive/85 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/80 shadow-destructive/20",
        outline:
          "border bg-background/80 hover:bg-accent/90 hover:text-accent-foreground dark:bg-input/50 dark:border-input dark:hover:bg-input/70 shadow-accent/10",
        secondary:
          "bg-secondary/90 text-secondary-foreground hover:bg-secondary/85 shadow-secondary/20",
        ghost:
          "hover:bg-accent/80 hover:text-accent-foreground dark:hover:bg-accent/60 shadow-none",
        link: "text-primary underline-offset-4 hover:underline shadow-none",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
