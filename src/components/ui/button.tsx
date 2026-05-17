import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-indigo-600 text-white shadow hover:bg-indigo-700": variant === 'default',
            "border border-slate-700 bg-slate-800/50 text-slate-200 hover:bg-slate-800": variant === 'outline',
            "hover:bg-slate-800 text-slate-300 hover:text-slate-100": variant === 'ghost',
            "bg-rose-500 text-white shadow-sm hover:bg-rose-600": variant === 'destructive',
            "h-10 px-4 py-2": size === 'default',
            "h-8 px-3 text-xs": size === 'sm',
            "h-11 px-8": size === 'lg',
            "h-10 w-10": size === 'icon',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
