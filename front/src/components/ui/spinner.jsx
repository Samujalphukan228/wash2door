// src/components/ui/spinner.jsx
import { cn } from '@/lib/utils';

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-3',
  xl: 'h-16 w-16 border-4',
};

function Spinner({ size = 'md', className }) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-gray-200 border-t-blue-600',
        sizeClasses[size],
        className
      )}
    />
  );
}

function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      <Spinner size="lg" />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
}

function LoadingOverlay({ message }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
      <Spinner size="md" />
      {message && <p className="mt-3 text-sm text-gray-600">{message}</p>}
    </div>
  );
}

export { Spinner, LoadingScreen, LoadingOverlay };