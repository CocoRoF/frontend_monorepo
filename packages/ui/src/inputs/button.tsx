'use client';

import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  iconOnly?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-primary/85 active:bg-primary/75',
        secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300',
        outline: 'border border-border bg-transparent text-foreground hover:bg-accent active:bg-gray-200',
        ghost: 'bg-transparent text-foreground hover:bg-accent active:bg-gray-200',
        danger: 'bg-error text-white hover:bg-error/85 active:bg-error/75',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-md',
        md: 'h-10 px-4 text-sm rounded-md',
        lg: 'h-12 px-6 text-base rounded-lg',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', leftIcon, rightIcon, iconOnly = false, loading = false, fullWidth = false, disabled, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(buttonVariants({ variant, size }), iconOnly && 'p-0 aspect-square', fullWidth && 'w-full', loading && 'cursor-wait', className)}
        {...props}
      >
        {loading && (
          <span className="animate-spin">
            <svg className="h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.4 31.4" />
            </svg>
          </span>
        )}
        {!loading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        {!iconOnly && <span>{children}</span>}
        {iconOnly && !loading && children}
        {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;