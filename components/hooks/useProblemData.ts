import { useState, useEffect } from 'react';
import { questionService } from '@/lib/services/questionService';

// Define types for problem data
export interface TestCase {
  id: string;
  input: string;
  output: string;
  isSample: boolean;
  isHidden: boolean;
  showOnFailure?: boolean;
  gradePercentage?: number;
}

export interface LanguageOption {
  id: string;
  language: string; // This is the Judge0 language ID
  name?: string;    // This is the Judge0 language name
  preloadCode?: string;
  solution?: string;
}

export interface ProblemData {
  id: string;
  number?: number;
  title: string;
  difficulty: string;
  tags?: { id: string; name: string }[];
  level?: number;
  description: string;
  inputFormat?: string;
  outputFormat?: string;
  sampleTestCases: TestCase[];
  hiddenTestCases?: TestCase[];
  starterCode?: string;
  solution?: string;
  explanation?: string;
  xpReward?: number;
  languageOptions: LanguageOption[];
}

// Custom hook for fetching problem data and languages
export function useProblemData(problemId: string) {
  const [problem, setProblem] = useState<ProblemData | null>(null);
  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLanguageLoading, setIsLanguageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch problem data
  useEffect(() => {
    let isMounted = true;
    
    async function fetchData() {
      if (!problemId) return;
      
      setIsLoading(true);
      setIsLanguageLoading(true);
      
      try {
        // Fetch problem details
        const problemDetails = await questionService.getProblemDetail(problemId);
        
        if (isMounted) {
          setProblem(problemDetails);
        }
        
        // Fetch available languages
        const languageData = await questionService.getProblemLanguages(problemId);
        
        if (isMounted) {
          // Format language options to ensure consistency
          const formattedLanguages = languageData.map((lang: LanguageOption) => ({
            id: lang.id,
            language: lang.language, // This is the Judge0 language ID
            name: lang.name || String(lang.language), // Use name from GraphQL or fallback to language ID
            preloadCode: lang.preloadCode || '',
            solution: lang.solution || ''
          }));
          
          setLanguages(formattedLanguages);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Error fetching problem data:', err);
          setError(err.message || 'Failed to load problem data');
          
          // Set fallback problem if fetch fails
          if (!problem) {
            setProblem({
              id: problemId,
              title: "Problem information unavailable",
              description: "There was an error loading this problem. Please try again later.",
              difficulty: "MEDIUM",
              sampleTestCases: [],
              languageOptions: []
            });
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsLanguageLoading(false);
        }
      }
    }
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [problemId]);

  return {
    problem,
    languages,
    isLoading,
    isLanguageLoading,
    error
  };
} 