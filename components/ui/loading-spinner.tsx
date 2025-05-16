import React from 'react';
import { Spinner } from './spinner';

/**
 * A standardized full-screen loading spinner component
 * Used primarily for page transitions, data loading, and dynamic imports
 */
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-white dark:bg-slate-950">
      <Spinner size="lg" />
    </div>
  );
} 