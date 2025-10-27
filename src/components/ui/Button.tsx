import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

    const variants = {
      primary: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 shadow-md hover:shadow-lg active:scale-[0.98]',
      secondary: 'bg-gray-900 text-white hover:bg-gray-800 shadow-md',
      outline: 'border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50',
      ghost: 'hover:bg-gray-100',
      danger: 'bg-red-600 text-white hover:bg-red-700 shadow-md',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
