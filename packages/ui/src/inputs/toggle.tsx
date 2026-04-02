'use client';

import React, { useId } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const toggleTrack = cva(
  'relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus-within:ring-2 focus-within:ring-primary/30',
  {
    variants: {
      size: {
        sm: 'h-4 w-7',
        md: 'h-5 w-9',
        lg: 'h-6 w-11',
      },
      checked: {
        true: 'bg-primary',
        false: 'bg-gray-300',
      },
    },
    defaultVariants: { size: 'md', checked: false },
  }
);

const toggleKnob = cva(
  'absolute top-0.5 rounded-full bg-white shadow-sm transition-transform duration-200',
  {
    variants: {
      size: {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5',
      },
      checked: {
        true: '',
        false: 'translate-x-0.5',
      },
    },
    compoundVariants: [
      { size: 'sm', checked: true, class: 'translate-x-3.5' },
      { size: 'md', checked: true, class: 'translate-x-4.5' },
      { size: 'lg', checked: true, class: 'translate-x-5.5' },
    ],
    defaultVariants: { size: 'md', checked: false },
  }
);

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  labelPosition?: 'left' | 'right';
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  name?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  labelPosition = 'right',
  disabled = false,
  size = 'md',
  className,
  name,
}) => {
  const id = useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  const track = (
    <div className={toggleTrack({ size, checked })}>
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className="sr-only"
      />
      <span className={toggleKnob({ size, checked })} />
    </div>
  );

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2',
        disabled && 'opacity-50 pointer-events-none',
        className,
      )}
    >
      {label && labelPosition === 'left' && (
        <label htmlFor={id} className="text-sm text-foreground cursor-pointer select-none">
          {label}
        </label>
      )}
      {track}
      {label && labelPosition === 'right' && (
        <label htmlFor={id} className="text-sm text-foreground cursor-pointer select-none">
          {label}
        </label>
      )}
    </div>
  );
};

export default Toggle;