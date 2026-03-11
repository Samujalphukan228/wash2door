// src/components/ui/rating.jsx
'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
};

function Rating({
  value = 0,
  onChange,
  readonly = false,
  size = 'md',
  showValue = false,
  showCount,
  className,
}) {
  const [hoverValue, setHoverValue] = useState(null);

  const displayValue = hoverValue ?? value;

  const handleClick = (rating) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={cn(
            'transition-transform',
            !readonly && 'hover:scale-110 cursor-pointer',
            readonly && 'cursor-default'
          )}
          onClick={() => handleClick(star)}
          onMouseEnter={() => !readonly && setHoverValue(star)}
          onMouseLeave={() => !readonly && setHoverValue(null)}
        >
          <Star
            className={cn(
              sizeClasses[size],
              'transition-colors',
              star <= displayValue
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            )}
          />
        </button>
      ))}
      {showValue && (
        <span className="ml-2 text-sm font-medium text-gray-600">
          {value.toFixed(1)}
        </span>
      )}
      {showCount !== undefined && (
        <span className="ml-1 text-sm text-gray-500">
          ({showCount})
        </span>
      )}
    </div>
  );
}

// Display only rating (no interaction)
function RatingDisplay({ value, size = 'sm', showValue = true, count }) {
  return (
    <div className="flex items-center gap-1">
      <Star
        className={cn(
          sizeClasses[size],
          'fill-yellow-400 text-yellow-400'
        )}
      />
      {showValue && (
        <span className="text-sm font-medium text-gray-700">
          {value.toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span className="text-sm text-gray-500">
          ({count} reviews)
        </span>
      )}
    </div>
  );
}

export { Rating, RatingDisplay };