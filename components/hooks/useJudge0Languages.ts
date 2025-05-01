import { useEffect, useState } from 'react';

export interface Judge0Language {
  id: number;
  name: string;
  description?: string;
  extensions?: string[];
  // Add more fields as needed from Judge0
}

export function useJudge0Languages() {
  const [languages, setLanguages] = useState<Judge0Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetch('/api/judge0')
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          if (data.success && Array.isArray(data.data)) {
            setLanguages(data.data);
            setError(null);
          } else {
            setError('Failed to load languages');
          }
        }
      })
      .catch(err => {
        if (isMounted) setError(err.message || 'Error fetching languages');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  return { languages, loading, error };
} 