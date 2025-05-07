import { useEffect, useState, useMemo } from 'react';
import { questionService } from '@/lib/services/questionService';

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
    setHasFetched(true);

    // Use GraphQL API to fetch languages with names and versions
    questionService.getEditorData()
      .then(editorData => {
        if (isMounted) {
          if (editorData && Array.isArray(editorData.judge0Languages)) {
            // Enhanced logging to debug duplicate languages
            const languagesCount = editorData.judge0Languages.length;
            console.log(`[JUDGE0] Fetched ${languagesCount} languages from GraphQL`);
            
            // Check for any languages with is_archived flag
            const archivedCount = editorData.judge0Languages.filter((l: any) => l.is_archived === true).length;
            if (archivedCount > 0) {
              console.log(`[JUDGE0] Warning: ${archivedCount} archived languages found`);
            }
            
            // Log a sample of the first few languages to verify format
            console.log('[JUDGE0] Sample languages:', editorData.judge0Languages.slice(0, 3));
            
            setLanguages(editorData.judge0Languages);
            setError(null);
          } else {
            setError('Failed to load languages');
            console.error('[JUDGE0] Failed to load languages from GraphQL');
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