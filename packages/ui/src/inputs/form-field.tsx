'use client';

import React, { useId } from 'react';
import { cn } from '../lib/utils';

export interface FormFieldProps {
  children: React.ReactNode;
  label?: string;
  required?: boolean;
  description?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  children, label, required = false, description, error, hint, disabled = false, className,
}) => {
  const id = useId();
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', disabled && 'opacity-50', className)}>
      {label && (
        <label className="text-sm font-medium text-foreground" htmlFor={id}>
          {label}
          {required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}
      {description && <p id={descriptionId} className="text-xs text-muted-foreground">{description}</p>}
      <div>
        {React.isValidElement(children)
          ? React.cloneElement(children as React.ReactElement<any>, {
              id,
              'aria-describedby': [descriptionId, errorId].filter(Boolean).join(' ') || undefined,
              'aria-invalid': !!error,
              disabled,
            })
          : children}
      </div>
      {error && <p id={errorId} className="text-xs text-error" role="alert">{error}</p>}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
};

export default FormField;