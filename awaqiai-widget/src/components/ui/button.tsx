import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "bw:inline-flex bw:items-center bw:justify-center bw:whitespace-nowrap bw:rounded-md bw:text-sm bw:font-medium bw:transition-colors focus-visible:bw:outline-hidden focus-visible:bw:ring-1 focus-visible:bw:ring-ring disabled:bw:pointer-events-none disabled:bw:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bw:bg-primary bw:text-primary-foreground hover:bw:opacity-90",
        outline:
          "bw:border bw:border-input bw:bg-background hover:bw:bg-accent hover:bw:text-accent-foreground",
        ghost: "hover:bw:bg-accent hover:bw:text-accent-foreground",
        link: "bw:text-primary bw:underline-offset-4 hover:bw:underline",
      },
      size: {
        default: "bw:h-9 bw:px-4 bw:py-2",
        sm: "bw:h-8 bw:rounded-md bw:px-3 bw:text-xs",
        lg: "bw:h-10 bw:rounded-md bw:px-8",
        icon: "bw:h-9 bw:w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants } 