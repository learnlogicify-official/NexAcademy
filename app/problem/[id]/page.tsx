import { Suspense } from 'react'
import { Metadata, ResolvingMetadata } from 'next'
import ProblemPageClient from '@/app/nexpractice/problem/[id]/page'
import { notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

// Types for better type safety
type ProblemData = {
  id: string;
  title: string;
  difficulty: string;
  description: string;
  tags?: string[];
  // Other fields as needed
}

// Bundle response type
type BundleResponse = {
  problem: ProblemData;
  judge0Languages: any[];
  statistics: any;
  similarProblems: any[];
  lastLanguage: string | null;
}

/**
 * Generate static params for the most popular problems
 * This helps with SEO and performance for frequently visited problems
 * 
 * @returns Array of problem IDs for static generation
 */
export async function generateStaticParams() {
  try {
    // Fetch popular problem IDs
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/popular-problems`,
      { next: { revalidate: 86400 } } // Cache for a day
    );
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    
    // Return the popular problem IDs as params
    return data.problems.map((problem: { id: string }) => ({
      id: problem.id,
    }));
  } catch (error) {
    console.error('Error fetching popular problems:', error);
    // Return empty array to avoid blocking build
    return [];
  }
}

/**
 * Generate metadata for the problem page
 * This function is called by Next.js during build/request
 * 
 * @param params - URL parameters
 * @param parent - Parent metadata
 * @returns Metadata for the page
 */
export async function generateMetadata(
  { params }: { params: { id: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const problemId = params.id
  
  // Fetch problem data for metadata
  const problem = await fetchProblemData(problemId)
  
  // Handle missing problem
  if (!problem) {
    return {
      title: 'Problem Not Found',
      description: 'The requested coding problem could not be found.'
    }
  }
  
  // Get base metadata from parent
  const previousImages = (await parent).openGraph?.images || []
  
  return {
    title: `${problem.title} | NexAcademy`,
    description: `Solve the ${problem.difficulty} coding problem "${problem.title}" on NexAcademy.`,
    openGraph: {
      title: `${problem.title} - ${problem.difficulty} | NexAcademy`,
      description: `Practice your coding skills with "${problem.title}" - a ${problem.difficulty} level problem on NexAcademy.`,
      images: [...previousImages],
      type: 'article',
      authors: ['NexAcademy'],
      tags: problem.tags,
    },
  }
}

/**
 * Fetch problem data from API with better error handling
 * Used only for metadata generation to avoid duplicate data fetching
 * 
 * @param problemId - ID of the problem to fetch
 * @returns Problem data or null if not found
 */
async function fetchProblemData(problemId: string): Promise<ProblemData | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/problem/${problemId}`, 
      {
        next: { revalidate: 3600 }, // Cache for an hour
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      // Throw specific error based on status code
      if (response.status === 404) {
        throw new Error('PROBLEM_NOT_FOUND');
      }
      throw new Error(`Failed to fetch problem data: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching problem data:', error);
    // Re-throw specific errors for proper handling
    if (error instanceof Error && error.message === 'PROBLEM_NOT_FOUND') {
      throw error;
    }
    return null;
  }
}

/**
 * Fetch all problem-related data in a single request
 * This consolidated API improves performance by reducing network overhead
 * 
 * @param problemId - ID of the problem to fetch
 * @returns Bundle with problem data, languages, statistics, and similar problems
 */
async function fetchBundledData(problemId: string): Promise<BundleResponse | null> {
  try {
    // We can't use localStorage in server component, so we'll only add the query parameter
    // in the client component or during a client-side navigation
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/problem/${problemId}/bundle`,
      {
        next: { revalidate: 3600 }, // Cache for an hour
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('PROBLEM_NOT_FOUND');
      }
      throw new Error(`Failed to fetch bundled data: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching bundled data:', error);
    if (error instanceof Error && error.message === 'PROBLEM_NOT_FOUND') {
      throw error;
    }
    return null;
  }
}

/**
 * Server Component to show key problem info during initial load
 * This renders instantly from the server while the client component loads
 */
function ProblemPageShell({ problemData }: { problemData: ProblemData }) {
  // Difficulty badge colors
  const difficultyColor = {
    Easy: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    Hard: 'bg-red-100 text-red-800',
  }[problemData.difficulty] || 'bg-gray-100 text-gray-800';

  return (
    <div className="h-full w-full p-4 bg-white dark:bg-gray-950 transition-opacity duration-500" id="problem-shell">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">{problemData.title}</h1>
        
        <div className="flex gap-2 items-center mb-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColor}`}>
            {problemData.difficulty}
          </span>
          
          {problemData.tags?.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="prose dark:prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: problemData.description }} />
        </div>
        
        <div className="mt-8 animate-pulse flex justify-center">
          <p className="text-sm text-gray-500">Loading editor environment...</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Loading component for better visual feedback
 * Displayed while the main client component is loading
 */
function ProblemPageLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="animate-spin h-8 w-8 border-4 border-t-indigo-500 border-indigo-200 rounded-full mb-4"></div>
      <h2 className="text-lg font-medium">Loading problem...</h2>
    </div>
  );
}

/**
 * Loading component for streaming data
 * Used for progressive loading of non-critical components
 */
function ProblemStatisticsLoading() {
  return (
    <div className="p-4 rounded-md bg-gray-50 dark:bg-gray-900 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mb-2 w-3/4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
    </div>
  );
}

/**
 * Component to display problem statistics
 */
function ProblemStatistics({ statistics }: { statistics: any }) {
  if (!statistics) return null;
  
  return (
    <div className="p-4 rounded-md bg-gray-50 dark:bg-gray-900">
      <h3 className="font-medium mb-2">Problem Statistics</h3>
      <p>Acceptance Rate: {statistics.acceptanceRate}%</p>
      <p>Submissions: {statistics.totalSubmissions}</p>
      <p>Solutions: {statistics.totalSolutions}</p>
    </div>
  );
}

/**
 * Component to display similar problems
 */
function SimilarProblems({ problems }: { problems: any[] }) {
  if (!problems?.length) return null;
  
  return (
    <div className="p-4 rounded-md bg-gray-50 dark:bg-gray-900">
      <h3 className="font-medium mb-2">Similar Problems</h3>
      <ul className="space-y-1">
        {problems.map(problem => (
          <li key={problem.id}>
            <a href={`/problem/${problem.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
              {problem.title}
            </a>
            <span className="text-xs ml-2 text-gray-500">({problem.difficulty})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Error boundary to handle rendering errors
 */
function ProblemError({ error }: { error: Error }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-2xl font-bold text-red-500 mb-4">Failed to load problem</h2>
      <p className="text-gray-600 mb-6">{error.message}</p>
      <a href="/" className="px-4 py-2 bg-indigo-600 text-white rounded-md">
        Return to Home
      </a>
    </div>
  );
}

/**
 * Main Problem Page Component
 * Uses the bundled API for efficient data loading
 */
export default async function ProblemPage({ params }: { params: { id: string } }) {
  const problemId = params.id;
  
  try {
    // Fetch all data in a single request using the bundled API
    const bundleData = await fetchBundledData(problemId);
    
    // Handle not found
    if (!bundleData || !bundleData.problem) {
      return notFound();
    }
    const problemId = params.id;
  const session = await getServerSession(authOptions);

  // Fetch problem and languages as before
 

  // --- THIS IS THE IMPORTANT PART ---
  
  if (session?.user?.id) {
    // Fetch from UserProblemSettings (or your equivalent table)
    const userSetting = await prisma.userProblemSetting.findUnique({
      where: {
        userId_problemId: {
          userId: session.user.id,
          problemId: problemId,
        },
      },
      select: { language: true },
    });
    lastLanguage = userSetting?.language || null;
  }
    const { problem: problemData, judge0Languages, statistics, similarProblems, lastLanguage } = bundleData;
    
    // Prepare initial data for client-side hydration
    const initialData = {
      problem: problemData,
      judge0Languages: judge0Languages || null,
      lastLanguage // Include the last selected language
    };
    
    // Script for hydration data with proper escaping to prevent XSS
    const safeJSON = JSON.stringify(initialData)
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e')
      .replace(/&/g, '\\u0026')
      .replace(/\//g, '\\u002f');
    
    const scriptContent = `window.__NEXT_DATA__ = {
      props: {
        pageProps: {
          initialData: ${safeJSON}
        }
      }
    };`;

    // Add client-side code to handle language selection persistence
    // This enhanced version includes detailed debugging and ensures correct localStorage behavior
    const languagePersistenceScript = `
      document.addEventListener('DOMContentLoaded', function() {
        
        // First, check if there's a saved language in localStorage
        const problemId = "${problemId}";
        const savedLanguage = localStorage.getItem('nexacademy_last_language_' + problemId);
        
        
        if (savedLanguage) {
          // Dispatch an event to notify our app about the saved language
        
          window.dispatchEvent(new CustomEvent('nexacademy:savedLanguageLoaded', {
            detail: {
              problemId: problemId,
              language: savedLanguage
            }
          }));
        }
        
        // Set up the listener for language changes
        window.addEventListener('nexacademy:languageChanged', function(e) {
          try {
            if (e.detail && e.detail.problemId && e.detail.language && e.detail.languageName) {
             
              
              // Store the full language name instead of just the ID
              localStorage.setItem('nexacademy_last_language_' + e.detail.problemId, e.detail.languageName);
             
              
              // Update last-language on server if an API call is requested
              if (e.detail.updateServer) {
              
                
                fetch('/api/problem/' + e.detail.problemId + '/last-language', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ language: e.detail.languageName }),
                  credentials: 'include'
                }).then(response => {
                 
                }).catch(err => {
                  console.error('[DEBUG] Error updating last language:', err);
                });
              }
            }
          } catch (err) {
            console.error('[DEBUG] Error in language persistence handler:', err);
          }
        });
        
        // Add a debugging method to the window
        window.debugLastLanguage = function() {
        };

      });
    `;

    // Add client-side onLoad to handle the transition from server shell to client component
    const transitionScript = `
      document.addEventListener('DOMContentLoaded', function() {
        const shell = document.getElementById('problem-shell');
        if (shell) {
          setTimeout(() => {
            shell.style.opacity = '0';
            setTimeout(() => {
              shell.style.display = 'none';
            }, 500);
          }, 300);
        }
      });
    `;

    // Handle page unload, tab switch, etc. to sync last language to server
    // NO automatic sync on page load
    const syncOnEventsScript = `
      document.addEventListener('DOMContentLoaded', function() {
        const problemId = "${problemId}";
        let currentLanguage = null;
        
        // Helper function to get current language
        function getCurrentLanguage() {
          return window.__CURRENT_LANGUAGE || localStorage.getItem('nexacademy_last_language_' + problemId);
        }
        
        // Save last language to server on specific events
        function saveLastLanguageToServer() {
          const langToSave = getCurrentLanguage();
          
          if (!langToSave) {
            return;
          }
          
          
          // Using fetch with keepalive for page unload events
          fetch('/api/problem/' + problemId + '/last-language', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ language: langToSave }),
            credentials: 'include',
            keepalive: true
          }).catch(err => {
            // We can't log on unload, but the request will still be sent
          });
        }
        
        // Update currentLanguage when it changes
        window.addEventListener('nexacademy:languageChanged', function(e) {
          if (e.detail && e.detail.languageName) {
            window.__CURRENT_LANGUAGE = e.detail.languageName;
            currentLanguage = e.detail.languageName;
          }
        });
        
        // Page unload - always save
        window.addEventListener('beforeunload', saveLastLanguageToServer);
        
        // Tab switch - save when tab becomes hidden
        document.addEventListener('visibilitychange', function() {
          if (document.visibilityState === 'hidden') {
            saveLastLanguageToServer();
          }
        });
        
        // Add global methods for run and submit buttons to call
        window.__saveLastLanguageToServer = saveLastLanguageToServer;
        
        // Log that we're not syncing on load
       
      });
    `;

    return (
      <>
        {/* Script to inject the data for client-side hydration */}
        <script
          id="__NEXT_DATA__SCRIPT"
          type="application/json"
          dangerouslySetInnerHTML={{ __html: scriptContent }}
        />
        
        {/* Script to handle transition */}
        <script
          dangerouslySetInnerHTML={{ __html: transitionScript }}
        />
        
        {/* Script to handle language persistence */}
        <script
          dangerouslySetInnerHTML={{ __html: languagePersistenceScript }}
        />
        
        {/* Script to handle saving on specific events */}
        <script
          dangerouslySetInnerHTML={{ __html: syncOnEventsScript }}
        />
        
        {/* Render server-first skeleton UI */}
        <ProblemPageShell problemData={problemData} />
        
        {/* Optional server components as sidebar content - now directly using the data from bundle */}
        <div className="hidden lg:block fixed right-4 top-20 w-64 space-y-4" id="problem-sidebar">
          <ProblemStatistics statistics={statistics} />
          <SimilarProblems problems={similarProblems} />
        </div>
        
        {/* Render the client component with a loading fallback using Suspense */}
        <Suspense fallback={<ProblemPageLoading />}>
          <ProblemPageClient initialData={initialData} />
        </Suspense>
      </>
    );
  } catch (error) {
    // Handle specific known errors
    if (error instanceof Error && error.message === 'PROBLEM_NOT_FOUND') {
      return notFound();
    }
    
    // For other errors, show error component
    return <ProblemError error={error instanceof Error ? error : new Error('Unknown error')} />;
  }
}

