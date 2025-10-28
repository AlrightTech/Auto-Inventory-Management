import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-neon-blue to-neon-green text-primary-foreground hover:from-neon-green hover:to-neon-purple shadow-gauge hover:shadow-neon-lg instrument-panel",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-gauge hover:shadow-lg hover:shadow-destructive/20",
        outline:
          "border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground shadow-gauge hover:shadow-neon",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-gauge hover:shadow-lg",
        ghost: "text-foreground hover:bg-accent hover:text-accent-foreground",
        link: "text-neon-blue underline-offset-4 hover:text-neon-green hover:underline",
        accent: "bg-gradient-to-r from-neon-green to-neon-purple text-accent-foreground hover:from-neon-purple hover:to-neon-blue shadow-gauge hover:shadow-neon-lg",
        success: "bg-gradient-to-r from-neon-green to-green-600 text-white hover:from-green-600 hover:to-neon-green shadow-gauge hover:shadow-lg hover:shadow-green-500/20",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-11 rounded-xl px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };