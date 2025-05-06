import { useEffect, useState, useMemo } from 'react';

export interface Judge0Language {
  id: number;
  name: string;
  description?: string;
  extensions?: string[];
  // Add more fields as needed from Judge0
}

export function useJudge0Languages(initialLanguages: Judge0Language[] = []) {
  // Memoize the initialLanguages to prevent identity changes from causing re-renders
  const memoizedInitialLanguages = useMemo(() => initialLanguages, [
    // Use a stable key based on length and first/last item if available
    initialLanguages.length,
    initialLanguages[0]?.id,
    initialLanguages[initialLanguages.length - 1]?.id,
  ]);
  
  const [languages, setLanguages] = useState<Judge0Language[]>(memoizedInitialLanguages);
  const [loading, setLoading] = useState(memoizedInitialLanguages.length === 0);
  const [error, setError] = useState<string | null>(null);
  
  // Track if we've already fetched
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    // If we already have languages from SSR, don't fetch again
    if (memoizedInitialLanguages.length > 0 || hasFetched) {
      return;
    }

    let isMounted = true;
    setLoading(true);
    
    console.log('[JUDGE0] Fetching languages');
    setHasFetched(true);
    
    fetch('/api/judge0')
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          if (data.success && Array.isArray(data.data)) {
            setLanguages(data.data);
            console.log(`[JUDGE0] Loaded ${data.data.length} languages`);
            setError(null);
          } else {
            setError('Failed to load languages');
            console.error('[JUDGE0] Failed to load languages');
          }
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err.message || 'Error fetching languages');
          console.error('[JUDGE0] Error fetching languages:', err);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [memoizedInitialLanguages, hasFetched]);

  // Return a memoized result to prevent identity changes
  return useMemo(() => ({ 
    languages, 
    loading, 
    error 
  }), [languages, loading, error]);
} 