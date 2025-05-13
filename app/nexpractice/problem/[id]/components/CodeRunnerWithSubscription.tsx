'use client';

import { useState, useEffect } from 'react';
import { useMutation, useSubscription } from '@apollo/client';
import { SUBMIT_CODE, EXECUTION_PROGRESS_SUBSCRIPTION } from '../graphql/codeExecution';
import { generateUUID } from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { formatExecutionTime, formatMemory } from '@/utils/helpers';
import confetti from 'canvas-confetti';
import { useXpNotifications, StreakInfo } from '@/hooks/use-xp-notification';

interface TestCaseResult {
  id: string;
  input: string;
  expectedOutput: string;
  actualOutput: string | null;
  stderr: string | null;
  compileOutput: string | null;
  status: { id: number; description: string };
  verdict: string;
  isCorrect: boolean;
  executionTime: string | null;
  memoryUsed: string | null;
}

interface ExecutionResult {
  results: TestCaseResult[];
  allTestsPassed: boolean;
  totalTests: number;
  xp?: {
    awarded: boolean;
    amount: number;
    newTotal: number;
    levelUp: boolean;
    newLevel: number | null;
    streakInfo?: StreakInfo;
  };
}

interface CodeRunnerWithSubscriptionProps {
  sourceCode: string;
  languageId: number;
  problemId: string;
  onSuccess?: (result: ExecutionResult) => void;
  onError?: (error: string) => void;
}

export default function CodeRunnerWithSubscription({
  sourceCode,
  languageId,
  problemId,
  onSuccess,
  onError
}: CodeRunnerWithSubscriptionProps) {
  const [executionId] = useState(generateUUID());
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TestCaseResult[]>([]);
  const [completedTests, setCompletedTests] = useState(0);
  const [totalTests, setTotalTests] = useState(0);
  const [allTestsPassed, setAllTestsPassed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const { showSubmissionXpNotification } = useXpNotifications();

  // Submit code mutation
  const [submitCode] = useMutation(SUBMIT_CODE);

  // Subscribe to execution progress
  const { data: subscriptionData } = useSubscription(
    EXECUTION_PROGRESS_SUBSCRIPTION,
    {
      variables: { executionId },
      skip: !subscriptionActive,
    }
  );

  // Update state when subscription data is received
  useEffect(() => {
    if (subscriptionData?.executionProgress) {
      const progress = subscriptionData.executionProgress;
      setResults(progress.results);
      setCompletedTests(progress.completedTests);
      setTotalTests(progress.totalTests);
      
      // Check if all tests have completed
      if (progress.completedTests === progress.totalTests) {
        setLoading(false);
        const allPassed = progress.results.every((result: TestCaseResult) => result.isCorrect);
        setAllTestsPassed(allPassed);
        
        // Trigger confetti if all tests passed
        if (allPassed) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
        
        // Call onSuccess callback
        if (onSuccess) {
          onSuccess({
            results: progress.results,
            allTestsPassed: allPassed,
            totalTests: progress.totalTests
          });
        }
      }
    }
  }, [subscriptionData, onSuccess]);

  // Function to handle code submission
  const handleRunCode = async () => {
    if (!sourceCode.trim()) {
      setErrorMessage('Please write some code before submitting');
      if (onError) onError('Please write some code before submitting');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setResults([]);
    setSubscriptionActive(true);
    
    try {
      // Submit code with the execution ID for subscription tracking
      const response = await submitCode({
        variables: {
          input: {
            sourceCode,
            languageId,
            problemId,
            executeInParallel: true,
            executionId,
            // Add additional Judge0 settings for this specific execution
            judge0Settings: {
              cpu_time_limit: 10,          // 10 seconds
              cpu_extra_time: 2,           // 2 seconds extra
              wall_time_limit: 20,         // 20 seconds (max allowed)
              memory_limit: 512000,        // 512MB memory
              compilation_time_limit: 20,  // 20 seconds for compilation
              max_file_size: 50000,        // 50KB
              max_processes_and_or_threads: 60 // Allow more processes/threads for parallel jobs
            }
          }
        }
      });
      
      // Add debugging logs for XP data
      console.log('Submission response:', response?.data);
      
      // Check if XP was awarded and show notification
      const xpData = response?.data?.submitCode?.xp;
      console.log('XP data received:', xpData);
      
      if (xpData && xpData.awarded) {
        console.log('Showing XP notification for:', xpData);
        showSubmissionXpNotification(xpData);
      } else {
        console.log('No XP notification shown - no XP awarded or missing data');
      }
      
      // The results will come through the subscription
    } catch (error: any) {
      setLoading(false);
      const message = error.message || 'An error occurred during code execution';
      setErrorMessage(message);
      if (onError) onError(message);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Submit Button */}
      <Button 
        onClick={handleRunCode} 
        disabled={loading} 
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        {loading ? `Executing code... (${completedTests} of ${totalTests || '?'})` : 'Submit Solution'}
      </Button>
      
      {/* Error display */}
      {errorMessage && (
        <div className="p-4 border border-red-200 rounded bg-red-50 text-red-800 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p>{errorMessage}</p>
        </div>
      )}
      
      {/* Test results display */}
      {results.length > 0 && (
        <div className="border rounded-md overflow-hidden">
          <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
            <h3 className="font-medium">Test Results</h3>
            {completedTests === totalTests && (
              <div className="flex items-center gap-2">
                {allTestsPassed ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    All tests passed!
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    {results.filter(r => !r.isCorrect).length} tests failed
                  </span>
                )}
              </div>
            )}
          </div>
          
          <div className="divide-y">
            {results.map((result, index) => (
              <div key={result.id || index} className="p-4 flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium">Test Case {index + 1}</div>
                  <div className="mt-1 text-sm text-gray-600">
                    <div><strong>Input:</strong> {result.input}</div>
                    <div><strong>Expected:</strong> {result.expectedOutput}</div>
                    {result.actualOutput !== null && (
                      <div><strong>Output:</strong> {result.actualOutput}</div>
                    )}
                    {result.stderr && (
                      <div className="text-red-600"><strong>Error:</strong> {result.stderr}</div>
                    )}
                    {result.compileOutput && (
                      <div className="text-red-600">
                        <strong>Compile Error:</strong>
                        {result.compileOutput.includes("Compilation time limit exceeded") ? (
                          <div>
                            <p>Compilation time limit exceeded. This could be caused by:</p>
                            <ul className="list-disc pl-5 mt-1">
                              <li>Complex template meta-programming (for C++)</li>
                              <li>Very large recursive templates</li>
                              <li>Extremely large code size</li>
                              <li>Inefficient import statements (especially for Python)</li>
                            </ul>
                            <p className="mt-1">Try simplifying your code or reducing unnecessary imports.</p>
                          </div>
                        ) : result.compileOutput.includes("The Judge0 API is currently unreachable") ? (
                          <div>
                            <p>The Judge0 API is currently unreachable. Please check:</p>
                            <ul className="list-disc pl-5 mt-1">
                              <li>Your self-hosted Judge0 instance is running</li>
                              <li>The NEXT_PUBLIC_JUDGE0_API_URL in .env.local is correct</li>
                              <li>There are no network connectivity issues</li>
                            </ul>
                            <p className="mt-1">Contact your administrator if the problem persists.</p>
                          </div>
                        ) : (
                          result.compileOutput
                        )}
                      </div>
                    )}
                    {(result.executionTime || result.memoryUsed) && (
                      <div className="text-gray-500 text-xs mt-2">
                        {result.executionTime && (
                          <span className="mr-3">Time: {formatExecutionTime(result.executionTime)}</span>
                        )}
                        {result.memoryUsed && (
                          <span>Memory: {formatMemory(result.memoryUsed)}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  {result.verdict ? (
                    <div className={`px-2 py-1 rounded text-sm ${
                      result.isCorrect 
                        ? 'bg-green-100 text-green-800' 
                        : result.verdict === "Recompiling"
                          ? 'bg-blue-100 text-blue-800'
                          : result.verdict === "API Unreachable"
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                    }`}>
                      {result.verdict}
                    </div>
                  ) : (
                    <div className="px-2 py-1 rounded bg-gray-100 text-gray-800 text-sm">
                      Running...
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 