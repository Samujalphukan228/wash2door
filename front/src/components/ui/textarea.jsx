// src/components/ui/textarea.jsx
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Textarea = forwardRef(({
  className,
  label,
  error,
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          'flex min-h-[100px] w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm',
          'placeholder:text-gray-400',
          'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20',
          'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-50',
          'transition-all duration-200 resize-none',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
          className
        )}
        ref={ref}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export { Textarea };