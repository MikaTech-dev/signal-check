import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding font-medium whitespace-nowrap transition-all duration-150 outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-950 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 cursor-pointer [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-purple-950 text-white hover:bg-purple-900 active:bg-purple-950 shadow-xs border-purple-900/20",
        primary: "bg-purple-950 text-white hover:bg-purple-900 active:bg-purple-950 shadow-xs border border-purple-900/20",
        outline:
          "border-zinc-300 bg-white text-zinc-900 shadow-2xs hover:bg-zinc-50 active:bg-zinc-100",
        secondary:
          "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 active:bg-zinc-300 border border-zinc-200",
        'purple-subtle':
          "bg-purple-50 text-purple-950 hover:bg-purple-100 active:bg-purple-200 border border-purple-200",
        ghost:
          "bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 active:bg-zinc-200",
        destructive:
          "bg-rose-600 text-white hover:bg-rose-500 active:bg-rose-700 shadow-xs border border-rose-600",
        danger:
          "bg-rose-600 text-white hover:bg-rose-500 active:bg-rose-700 shadow-xs border border-rose-600",
        link: "text-purple-950 underline-offset-4 hover:underline",
      },
      size: {
        default: "text-sm px-4 py-2 min-h-[44px] gap-2",
        sm: "text-xs px-3 py-1.5 min-h-[38px] gap-1.5",
        md: "text-sm px-4 py-2.5 min-h-[44px] gap-2",
        lg: "text-base px-6 py-3 min-h-[48px] gap-2.5",
        icon: "size-9",
        "icon-xs": "size-6",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
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
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "default",
      size = "default",
      isLoading = false,
      disabled,
      leftIcon,
      rightIcon,
      type = "button",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        data-slot="button"
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = "Button"

export { buttonVariants }
