// src/components/ui/avatar.jsx
import { cn, getInitials } from '@/lib/utils';

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
  '2xl': 'h-20 w-20 text-xl',
};

function Avatar({
  src,
  alt,
  name,
  size = 'md',
  className,
}) {
  const initials = name ? getInitials(name) : '?';

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name || 'Avatar'}
        className={cn(
          'rounded-full object-cover',
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-blue-600 text-white font-medium',
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  );
}

export { Avatar };