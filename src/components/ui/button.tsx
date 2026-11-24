import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-tide focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer rounded-none select-none tracking-wide font-sans',
  {
    variants: {
      variant: {
        primary: 'bg-charcoal text-white hover:bg-charcoal/90 shadow-2xs',
        brand: 'bg-tide text-white hover:bg-tide/90 shadow-2xs',
        secondary: 'bg-sand-card text-charcoal border border-charcoal/30 hover:bg-sand',
        outline: 'border border-charcoal/30 bg-transparent text-charcoal hover:bg-sand-card',
        ghost: 'text-charcoal hover:bg-sand-subtle hover:text-charcoal',
        danger: 'bg-terracotta text-white hover:bg-terracotta/90 shadow-2xs',
        destructive: 'bg-terracotta text-white hover:bg-terracotta/90 shadow-2xs',
        celebrate: 'bg-terracotta text-white hover:bg-terracotta/90 shadow-2xs',
      },
      size: {
        default: 'h-10 px-4 py-2 text-xs',
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 py-2 text-xs',
        lg: 'h-11 px-6 text-sm uppercase tracking-wider',
        xl: 'h-12 px-8 text-base tracking-wider',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  fullWidth?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, fullWidth = false, isLoading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), fullWidth && 'w-full', className)}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        {children}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
