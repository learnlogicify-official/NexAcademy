import { getVerdict, Judge0StatusCode } from './judge0-status';

const JUDGE0_API_URL = process.env.NEXT_PUBLIC_JUDGE0_API_URL || "http://128.199.24.150:2358"
const JUDGE0_API_KEY = process.env.NEXT_PUBLIC_JUDGE0_API_KEY



// Current Judge0 language IDs (updated 2023)
const CURRENT_LANGUAGE_IDS = {
  // C
  "c": 50,          // C (GCC 9.2.0)
  
  // C++
  "cpp": 54,        // C++ (GCC 9.2.0)
  
  // Java
  "java": 62,       // Java (OpenJDK 13.0.1)
  
  // JavaScript
  "javascript": 63, // JavaScript (Node.js 12.14.0)
  
  // Python
  "python": 71,     // Python (3.8.1)
  
  // Ruby
  "ruby": 72,       // Ruby (2.7.0)
  
  // Swift
  "swift": 83,      // Swift (5.2.3)
  
  // Go
  "go": 60,         // Go (1.13.5)
};

// Map deprecated IDs to current IDs
function getUpdatedLanguageId(languageId: number): number {
  switch(languageId) {
    // Java
    case 10: // deprecated Java (old)
    case 11: // deprecated Java (openjdk)
      return 62; // current Java
      
    // JavaScript
    case 29:
    case 35:
      return 63; // current Node.js
    
    // Python
    case 36:
    case 70:
      return 71; // current Python
      
    // C++
    case 2:
    case 4:
    case 52:
      return 54; // current C++
      
    // Default: keep original ID if not in our mapping
    default:
      return languageId;
  }
}

export interface Judge0TestCase {
  input: string
  expectedOutput: string
}

export interface Judge0Result {
  input: string
  expected: string
  output: string | null
  stderr: string | null
  compile_output: string | null
  status: { id: number; description: string }
  verdict: string
  time?: string
  memory?: string
  isCorrect?: boolean
  isSkipped?: boolean
}

// Helper functions for base64 encoding/decoding
function base64Encode(str: string): string {
  // TEMPORARY: Disable base64 encoding to debug the issue
  console.log('base64Encode: returning string as-is (no encoding)');
  return str;
  
  // Check if the string is already base64 encoded to prevent double-encoding
  const isAlreadyBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(str) && str.length % 4 === 0 && str.length > 10;
  if (isAlreadyBase64) {
    console.warn('String appears to already be base64 encoded, returning as-is');
    return str;
  }
  
  if (typeof window !== 'undefined') {
    // Browser environment - use modern TextEncoder instead of deprecated escape/unescape
    try {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(str);
      const binaryString = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
      return btoa(binaryString);
    } catch (error) {
      console.error('Error in browser base64 encoding:', error);
      throw new Error('Failed to encode content for execution');
    }
  } else {
    // Node.js environment (for server-side)
    try {
      return Buffer.from(str).toString('base64');
    } catch (error) {
      console.error('Error in Node.js base64 encoding:', error);
      throw new Error('Failed to encode content for execution');
    }
  }
}

function base64Decode(str: string): string {
  // TEMPORARY: Disable base64 decoding to debug the issue
  console.log('base64Decode: returning string as-is (no decoding)');
  return str;
  
  try {
    if (typeof window !== 'undefined') {
      // Browser environment - use modern TextDecoder instead of deprecated escape/unescape
      const binaryString = atob(str);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const decoder = new TextDecoder();
      return decoder.decode(bytes);
    } else {
      // Node.js environment (for server-side)
      return Buffer.from(str, 'base64').toString('utf-8');
    }
  } catch (error) {
    console.error('Error decoding base64:', error, 'String was:', str.substring(0, 100));
    return '[Error decoding content]';
  }
}

// Fallback execution method when Judge0 API is unavailable
async function localFallbackExecution(
  sourceCode: string, 
  language: number, 
  testCases: Judge0TestCase[]
): Promise<Judge0Result[]> {
  
  // Simple local execution simulation
  const results: Judge0Result[] = []
  
  for (const testCase of testCases) {
    try {
      // For JavaScript only - extremely unsafe but just for demo/testing
      if (language === 63 || language === 93) { // Node.js
        try {
          // Extremely unsafe - only for testing when API is down!
          // eslint-disable-next-line no-new-func
          const userFunc = new Function("return " + sourceCode)()
          // Try to extract function parameters based on common patterns
          // This is very simplistic and only works for basic cases
          const input = testCase.input
          let result: any = null
          
          // Handle array inputs like [1,2,3,4]
          if (input.trim().startsWith('[') && input.trim().endsWith(']')) {
            try {
              const arr = JSON.parse(input.trim())
              if (Array.isArray(arr)) {
                result = userFunc(arr)
              }
            } catch {
              // If parsing fails, try other formats
            }
          }
          
          // Handle common LeetCode format like "nums = [1,2,3], target = 9"
          if (result === null && input.includes('=')) {
            const params: any[] = []
            const parts = input.split(',')
            
            parts.forEach(part => {
              const assignPart = part.trim().split('=')
              if (assignPart.length === 2) {
                try {
                  const value = eval(assignPart[1].trim()) // Extremely unsafe!
                  params.push(value)
                } catch {
                  // If eval fails, try as string
                  params.push(assignPart[1].trim())
                }
              }
            })
            
            if (params.length > 0) {
              result = userFunc(...params)
            }
          }
          
          // Default fallback - try direct execution
          if (result === null) {
            result = userFunc(input)
          }
          
          const output = JSON.stringify(result)
          const passed = output.trim() === testCase.expectedOutput.trim()
          
          results.push({
            input: testCase.input,
            expected: testCase.expectedOutput,
            output: output,
            stderr: null,
            compile_output: null,
            status: { 
              id: passed ? Judge0StatusCode.ACCEPTED : Judge0StatusCode.WRONG_ANSWER, 
              description: passed ? "Accepted" : "Wrong Answer" 
            },
            verdict: passed ? getVerdict(Judge0StatusCode.ACCEPTED) : getVerdict(Judge0StatusCode.WRONG_ANSWER)
          })
        } catch (error: any) {
          results.push({
            input: testCase.input,
            expected: testCase.expectedOutput,
            output: null,
            stderr: error.toString(),
            compile_output: null,
            status: { id: Judge0StatusCode.RUNTIME_ERROR_OTHER, description: "Runtime Error" },
            verdict: getVerdict(Judge0StatusCode.RUNTIME_ERROR_OTHER)
          })
        }
      } else {
        // For non-JS languages, show a helpful error message
        results.push({
          input: testCase.input,
          expected: testCase.expectedOutput,
          output: "Judge0 API unavailable - execution not possible",
          stderr: null,
          compile_output: "The Judge0 API is currently unreachable. Please check:\n1. Your self-hosted Judge0 instance is running\n2. The NEXT_PUBLIC_JUDGE0_API_URL in .env.local is correct\n3. There are no network connectivity issues",
          status: { id: Judge0StatusCode.INTERNAL_ERROR, description: "Internal Error" },
          verdict: "API Unreachable"
        })
      }
    } catch (e: any) {
      results.push({
        input: testCase.input,
        expected: testCase.expectedOutput,
        output: null,
        stderr: e.toString(),
        compile_output: "Error in local fallback execution: " + e.toString(),
        status: { id: 13, description: "Runtime Error" },
        verdict: "Runtime Error"
      })
    }
  }
  
  return results
}

// Existing function with sequential execution - renamed for clarity
export async function runWithJudge0Sequential({
  sourceCode,
  languageId,
  testCases,
  progressCallback,
  executionSettings = {}
}: {
  sourceCode: string
  languageId: number
  testCases: Judge0TestCase[]
  progressCallback?: ((results: Judge0Result[], index: number) => void) | undefined
  executionSettings?: {
    cpu_time_limit?: number;
    cpu_extra_time?: number;
    wall_time_limit?: number;
    memory_limit?: number;
    stack_limit?: number;
    compilation_time_limit?: number;
    max_file_size?: number;
    max_processes_and_or_threads?: number;
  }
}): Promise<Judge0Result[]> {
  // First check if we need to update the language ID
  const updatedLanguageId = getUpdatedLanguageId(languageId);
  if (updatedLanguageId !== languageId) {
    languageId = updatedLanguageId;
  }

  // Set reasonable limits for Judge0
  const wallTimeLimit = Math.min(executionSettings.wall_time_limit || 10, 20); // Max 20 seconds allowed
  const cpuTimeLimit = Math.min(executionSettings.cpu_time_limit || 5, 15);  // Max 15 seconds
  const compTimeLimit = Math.min(executionSettings.compilation_time_limit || 30, 30); // Max 30 seconds for compilation

  // Log the settings we're using

  // Batch processing works best with small batches of 8 test cases max
  const maxBatchSize = 8;
  const batches = [];
  
  for (let i = 0; i < testCases.length; i += maxBatchSize) {
    batches.push(testCases.slice(i, i + maxBatchSize));
  }
  
  
  // Initialize results array
  const results: Judge0Result[] = new Array(testCases.length).fill(null).map((_, index) => ({
    input: testCases[index].input,
    expected: testCases[index].expectedOutput,
    output: null,
    stderr: null,
    compile_output: null,
    status: { id: 1, description: "In Queue" },
    verdict: "In Queue",
  }));
  
  let completedCount = 0;
  let hasFailedTestCase = false;

  // Process each batch
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    // Skip remaining batches if a test case has failed
    if (hasFailedTestCase) {
      
      // Mark all remaining test cases as "Skipped"
      const startIdx = batchIndex * maxBatchSize;
      const remainingTestCases = batches[batchIndex];
      
      for (let i = 0; i < remainingTestCases.length; i++) {
        const globalIdx = startIdx + i;
        results[globalIdx] = {
          input: remainingTestCases[i].input,
          expected: remainingTestCases[i].expectedOutput,
          output: null,
          stderr: null,
          compile_output: null,
          status: { id: 0, description: "Skipped" },
          verdict: "Skipped",
          isSkipped: true
        };
      }
      
      completedCount += remainingTestCases.length;
      
      // Call progress callback
      if (progressCallback) {
        progressCallback(results, completedCount);
      }
      
      continue;
    }
    
    const batchTestCases = batches[batchIndex];
    const startIdx = batchIndex * maxBatchSize;
    
    try {
      // Prepare submission batch
      const submissions = batchTestCases.map(testCase => ({
        source_code: base64Encode(sourceCode),
        language_id: languageId,
        stdin: base64Encode(testCase.input),
        expected_output: base64Encode(testCase.expectedOutput),
        cpu_time_limit: cpuTimeLimit,
        cpu_extra_time: executionSettings.cpu_extra_time || 2,
        wall_time_limit: wallTimeLimit, 
        memory_limit: executionSettings.memory_limit || 512000,
        compilation_time_limit: compTimeLimit
      }));
      

      // Create batch submission (temporarily without base64_encoded parameter)
      const batchRes = await fetch(`${JUDGE0_API_URL}/submissions/batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ submissions }),
      });

      if (!batchRes.ok) {
        const errorText = await batchRes.text();
        console.error(`Judge0 batch submission error for batch ${batchIndex + 1}:`, errorText);
        
        // Try without base64 encoding as a fallback
        console.log('Trying batch submission without base64 encoding...');
        const submissionsPlain = batchTestCases.map(testCase => ({
          source_code: sourceCode, // No encoding
          language_id: languageId,
          stdin: testCase.input, // No encoding
          expected_output: testCase.expectedOutput, // No encoding
          cpu_time_limit: cpuTimeLimit,
          cpu_extra_time: executionSettings.cpu_extra_time || 2,
          wall_time_limit: wallTimeLimit, 
          memory_limit: executionSettings.memory_limit || 512000,
          compilation_time_limit: compTimeLimit
        }));

        const plainRes = await fetch(`${JUDGE0_API_URL}/submissions/batch`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ submissions: submissionsPlain }),
        });

        if (plainRes.ok) {
          console.log('Plain text submission succeeded, continuing with non-base64 approach...');
          // Handle the plain response (without base64 decoding later)
          // Update the batch tokens processing to not expect base64 encoded responses
          const batchTokens = await plainRes.json();
          if (!batchTokens || !Array.isArray(batchTokens) || batchTokens.length === 0) {
            throw new Error('Invalid response from Judge0 batch submission');
          }
          
          // Extract tokens
          const tokens = batchTokens.map((item: any) => item.token);
          if (tokens.some((token: any) => !token)) {
            throw new Error('Some tokens are missing in the batch response');
          }
          
          // Poll for results without base64 decoding
          const maxAttempts = 40;
          const pollingInterval = 1500;
          let attempts = 0;
          let batchDone = false;

          while (!batchDone && attempts < maxAttempts) {
            attempts++;
            await new Promise(resolve => setTimeout(resolve, pollingInterval));

            // Poll for batch status (temporarily without base64_encoded parameter)
            const batchStatusRes = await fetch(`${JUDGE0_API_URL}/submissions/batch?tokens=${tokens.join(',')}`, {
              headers: {
                "Content-Type": "application/json"
              }
            });

            if (!batchStatusRes.ok) {
              console.error(`Error polling batch ${batchIndex + 1} status:`, await batchStatusRes.text());
              continue;
            }

            const batchStatus = await batchStatusRes.json();
            if (!batchStatus || !batchStatus.submissions) {
              console.error('Invalid batch status response');
              continue;
            }

            // Update results with the latest status (temporarily no base64 decoding)
            let batchCompletedCount = 0;
            batchStatus.submissions.forEach((submission: any, idx: number) => {
              const globalIdx = startIdx + idx;
              
              // Temporarily no base64 decoding since we disabled encoding
              // if (submission.stdout) submission.stdout = base64Decode(submission.stdout);
              // if (submission.stderr) submission.stderr = base64Decode(submission.stderr);
              // if (submission.compile_output) submission.compile_output = base64Decode(submission.compile_output);
              // if (submission.message) submission.message = base64Decode(submission.message);

              // Update result if execution is done (status ID 3 or higher)
              if (submission.status && submission.status.id >= 3) {
                batchCompletedCount++;
                let verdict = "Unknown";
                let isCorrect = false;
                
                // Get stdout from the API response (may be null)
                const stdout = submission.stdout;
                
                if (submission.status.id === 3) {
                  // Safety check to ensure values exist and are strings before trim()
                  const stdoutStr = typeof stdout === 'string' ? stdout.trim() : '';
                  const expectedStr = typeof batchTestCases[idx].expectedOutput === 'string' ? batchTestCases[idx].expectedOutput.trim() : '';
                  isCorrect = (stdoutStr === expectedStr);
                  verdict = isCorrect ? "Accepted" : "Wrong Answer";
                  
                  // If this test case failed, set the flag
                  if (!isCorrect) {
                    hasFailedTestCase = true;
                  }
                } else {
                  // Use the standardized verdict function for other status codes
                  verdict = getVerdict(submission.status.id);
                  hasFailedTestCase = true;
                }

                // Special handling for time limit exceeded
                if (submission.status.id === Judge0StatusCode.TIME_LIMIT_EXCEEDED) {
                  verdict = "Time Limit Exceeded";
                  hasFailedTestCase = true;
                }
                // Special handling for compile errors
                else if (submission.status.id === Judge0StatusCode.COMPILATION_ERROR) {
                  verdict = "Compilation Error";
                  hasFailedTestCase = true;
                }
                // Special handling for runtime errors with stderr
                else if (submission.stderr && submission.stderr.trim() !== '' && verdict !== "Compilation Error") {
                  if (![7, 8, 9, 10, 11, 12].includes(submission.status.id)) {
                    verdict = "Runtime Error";
                  }
                  hasFailedTestCase = true;
                }

                // Update the result
                results[globalIdx] = {
                  input: batchTestCases[idx].input,
                  expected: batchTestCases[idx].expectedOutput,
                  output: stdout,
                  stderr: submission.stderr,
                  compile_output: submission.compile_output,
                  status: submission.status,
                  verdict,
                  time: submission.time,
                  memory: submission.memory,
                  isCorrect,
                  isSkipped: submission.status && submission.status.description === "Skipped"
                };
              }
            });

            // If we have a progress callback, call it with current results
            completedCount = results.filter(r => r.verdict !== "In Queue").length;
            if (progressCallback) {
              progressCallback(results, completedCount);
            }

            // Check if all submissions in this batch are done
            batchDone = batchCompletedCount === batchTestCases.length;
            if (batchDone) {
              break;
            }
          }
          
          // Continue to next batch
          continue;
        } else {
          console.error('Both base64 and plain text submissions failed');
        }
        
        // Fall back to sequential for this batch
        const batchResults = await runWithJudge0Sequential({
          sourceCode, 
          languageId, 
          testCases: batchTestCases,
          progressCallback: undefined,
          executionSettings: {
            ...executionSettings,
            wall_time_limit: wallTimeLimit,
            cpu_time_limit: cpuTimeLimit,
            compilation_time_limit: compTimeLimit
          }
        });
        
        // Copy results to the main results array
        batchResults.forEach((result, idx) => {
          const globalIdx = startIdx + idx;
          results[globalIdx] = result;
          
          // Check if this test case failed
          if (result.status.id !== 3 || 
              (typeof result.output === 'string' && result.output.trim() !== testCases[startIdx + idx].expectedOutput.trim())) {
            hasFailedTestCase = true;
          }
        });
        
        // Update completed count
        completedCount += batchTestCases.length;
        
        // Call progress callback
        if (progressCallback) {
          progressCallback(results, completedCount);
        }
        
        continue;
      }

      // Get tokens from batch response
      const batchTokens = await batchRes.json();
      if (!batchTokens || !Array.isArray(batchTokens) || batchTokens.length === 0) {
        throw new Error('Invalid response from Judge0 batch submission');
      }

      // Extract tokens
      const tokens = batchTokens.map(item => item.token);
      if (tokens.some(token => !token)) {
        throw new Error('Some tokens are missing in the batch response');
      }

      // Poll for results with longer timeout for compilation
      const maxAttempts = 40;
      const pollingInterval = 1500;
      let attempts = 0;
      let batchDone = false;

      while (!batchDone && attempts < maxAttempts) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, pollingInterval));

        // Poll for batch status (temporarily without base64_encoded parameter)
        const batchStatusRes = await fetch(`${JUDGE0_API_URL}/submissions/batch?tokens=${tokens.join(',')}`, {
          headers: {
            "Content-Type": "application/json"
          }
        });

        if (!batchStatusRes.ok) {
          console.error(`Error polling batch ${batchIndex + 1} status:`, await batchStatusRes.text());
          continue;
        }

        const batchStatus = await batchStatusRes.json();
        if (!batchStatus || !batchStatus.submissions) {
          console.error('Invalid batch status response');
          continue;
        }

        // Update results with the latest status (temporarily no base64 decoding)
        let batchCompletedCount = 0;
        batchStatus.submissions.forEach((submission: any, idx: number) => {
          const globalIdx = startIdx + idx;
          
          // Temporarily no base64 decoding since we disabled encoding
          // if (submission.stdout) submission.stdout = base64Decode(submission.stdout);
          // if (submission.stderr) submission.stderr = base64Decode(submission.stderr);
          // if (submission.compile_output) submission.compile_output = base64Decode(submission.compile_output);
          // if (submission.message) submission.message = base64Decode(submission.message);

          // Update result if execution is done (status ID 3 or higher)
          if (submission.status && submission.status.id >= 3) {
            batchCompletedCount++;
            let verdict = "Unknown";
            let isCorrect = false;
            
            // Get stdout from the API response (may be null)
            const stdout = submission.stdout;
            
            if (submission.status.id === 3) {
              // Safety check to ensure values exist and are strings before trim()
              const stdoutStr = typeof stdout === 'string' ? stdout.trim() : '';
              const expectedStr = typeof batchTestCases[idx].expectedOutput === 'string' ? batchTestCases[idx].expectedOutput.trim() : '';
              isCorrect = (stdoutStr === expectedStr);
              verdict = isCorrect ? "Accepted" : "Wrong Answer";
              
              // If this test case failed, set the flag
              if (!isCorrect) {
                hasFailedTestCase = true;
              }
            } else {
              // Use the standardized verdict function for other status codes
              verdict = getVerdict(submission.status.id);
              hasFailedTestCase = true;
            }

            // Special handling for time limit exceeded
            if (submission.status.id === Judge0StatusCode.TIME_LIMIT_EXCEEDED) {
              verdict = "Time Limit Exceeded";
              hasFailedTestCase = true;
            }
            // Special handling for compile errors
            else if (submission.status.id === Judge0StatusCode.COMPILATION_ERROR) {
              verdict = "Compilation Error";
              hasFailedTestCase = true;
            }
            // Special handling for runtime errors with stderr
            else if (submission.stderr && submission.stderr.trim() !== '' && verdict !== "Compilation Error") {
              if (![7, 8, 9, 10, 11, 12].includes(submission.status.id)) {
                verdict = "Runtime Error";
              }
              hasFailedTestCase = true;
            }

            // Update the result
            results[globalIdx] = {
              input: batchTestCases[idx].input,
              expected: batchTestCases[idx].expectedOutput,
              output: stdout,
              stderr: submission.stderr,
              compile_output: submission.compile_output,
              status: submission.status,
              verdict,
              time: submission.time,
              memory: submission.memory,
              isCorrect,
              isSkipped: submission.status && submission.status.description === "Skipped"
            };
          }
        });

        // If we have a progress callback, call it with current results
        completedCount = results.filter(r => r.verdict !== "In Queue").length;
        if (progressCallback) {
          progressCallback(results, completedCount);
        }

        // Check if all submissions in this batch are done
        batchDone = batchCompletedCount === batchTestCases.length;
        if (batchDone) {
          break;
        }
      }

      // If we still have pending test cases in this batch after max attempts,
      // fall back to sequential execution for those
      const pendingIndices = batchTestCases.map((_, idx) => {
        const globalIdx = startIdx + idx;
        return results[globalIdx].verdict === "In Queue" ? idx : -1;
      }).filter(idx => idx !== -1);

      if (pendingIndices.length > 0) {
        
        for (const idx of pendingIndices) {
          const globalIdx = startIdx + idx;
          const singleTestCase = [batchTestCases[idx]];
          
          try {
            const singleResult = await runWithJudge0Sequential({
              sourceCode,
              languageId,
              testCases: singleTestCase,
              progressCallback: undefined,
              executionSettings: {
                ...executionSettings,
                wall_time_limit: wallTimeLimit,
                cpu_time_limit: cpuTimeLimit,
                compilation_time_limit: compTimeLimit
              }
            });
            
            if (singleResult && singleResult.length > 0) {
              results[globalIdx] = singleResult[0];
              
              // Check if this test case failed
              if (singleResult[0].status.id !== 3 || 
                  (singleResult[0].verdict !== "Accepted")) {
                hasFailedTestCase = true;
              }
              
              // Update progress if callback provided
              completedCount = results.filter(r => r.verdict !== "In Queue").length;
              if (progressCallback) {
                progressCallback(results, completedCount);
              }
            }
          } catch (retryError) {
            console.error(`Error retrying test case ${globalIdx}:`, retryError);
            
            // Mark as failed if we couldn't process it
            results[globalIdx] = {
              input: batchTestCases[idx].input,
              expected: batchTestCases[idx].expectedOutput,
              output: null,
              stderr: `Failed to process: ${retryError}`,
              compile_output: null,
              status: { id: 13, description: "Runtime Error" },
              verdict: "Processing Failed",
            };
            
            // Set the failure flag
            hasFailedTestCase = true;
          }
        }
      }
    } catch (error) {
      console.error(`Error processing batch ${batchIndex + 1}:`, error);
      
      // Fall back to sequential for this batch
      const batchResults = await runWithJudge0Sequential({
        sourceCode,
        languageId,
        testCases: batchTestCases,
        progressCallback: undefined,
        executionSettings: {
          ...executionSettings,
          wall_time_limit: wallTimeLimit,
          cpu_time_limit: cpuTimeLimit,
          compilation_time_limit: compTimeLimit
        }
      });
      
      // Copy results to the main results array
      batchResults.forEach((result, idx) => {
        const globalIdx = startIdx + idx;
        results[globalIdx] = result;
        
        // Check if this test case failed
        if (result.status.id !== 3 || 
            (typeof result.output === 'string' && result.output.trim() !== testCases[startIdx + idx].expectedOutput.trim())) {
          hasFailedTestCase = true;
        }
      });
      
      // Update completed count
      completedCount += batchTestCases.length;
      
      // Call progress callback
      if (progressCallback) {
        progressCallback(results, completedCount);
      }
    }
  }
  
  return results
}

// New batch execution function that uses the Judge0 batch API
export async function runWithJudge0Batch({
  sourceCode,
  languageId,
  testCases,
  progressCallback,
  executionSettings = {}
}: {
  sourceCode: string
  languageId: number
  testCases: Judge0TestCase[]
  progressCallback?: ((results: Judge0Result[], index: number) => void) | undefined
  executionSettings?: {
    cpu_time_limit?: number;
    cpu_extra_time?: number;
    wall_time_limit?: number;
    memory_limit?: number;
    stack_limit?: number;
    compilation_time_limit?: number;
    max_file_size?: number;
    max_processes_and_or_threads?: number;
  }
}): Promise<Judge0Result[]> {
  // First check if we need to update the language ID
  const updatedLanguageId = getUpdatedLanguageId(languageId);
  if (updatedLanguageId !== languageId) {
    languageId = updatedLanguageId;
  }

  // Set reasonable limits for Judge0
  const wallTimeLimit = Math.min(executionSettings.wall_time_limit || 10, 20); // Max 20 seconds allowed
  const cpuTimeLimit = Math.min(executionSettings.cpu_time_limit || 5, 15);  // Max 15 seconds
  const compTimeLimit = Math.min(executionSettings.compilation_time_limit || 30, 30); // Max 30 seconds for compilation

  // Log the settings we're using

  // Batch processing works best with small batches of 8 test cases max
  const maxBatchSize = 8;
  const batches = [];
  
  for (let i = 0; i < testCases.length; i += maxBatchSize) {
    batches.push(testCases.slice(i, i + maxBatchSize));
  }
  
  
  // Initialize results array
  const results: Judge0Result[] = new Array(testCases.length).fill(null).map((_, index) => ({
    input: testCases[index].input,
    expected: testCases[index].expectedOutput,
    output: null,
    stderr: null,
    compile_output: null,
    status: { id: 1, description: "In Queue" },
    verdict: "In Queue",
  }));
  
  let completedCount = 0;
  let hasFailedTestCase = false;

  // Process each batch
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    // Skip remaining batches if a test case has failed
    if (hasFailedTestCase) {
      
      // Mark all remaining test cases as "Skipped"
      const startIdx = batchIndex * maxBatchSize;
      const remainingTestCases = batches[batchIndex];
      
      for (let i = 0; i < remainingTestCases.length; i++) {
        const globalIdx = startIdx + i;
        results[globalIdx] = {
          input: remainingTestCases[i].input,
          expected: remainingTestCases[i].expectedOutput,
          output: null,
          stderr: null,
          compile_output: null,
          status: { id: 0, description: "Skipped" },
          verdict: "Skipped",
          isSkipped: true
        };
      }
      
      completedCount += remainingTestCases.length;
      
      // Call progress callback
      if (progressCallback) {
        progressCallback(results, completedCount);
      }
      
      continue;
    }
    
    const batchTestCases = batches[batchIndex];
    const startIdx = batchIndex * maxBatchSize;
    
    try {
      // Prepare submission batch
      const submissions = batchTestCases.map(testCase => ({
        source_code: base64Encode(sourceCode),
        language_id: languageId,
        stdin: base64Encode(testCase.input),
        expected_output: base64Encode(testCase.expectedOutput),
        cpu_time_limit: cpuTimeLimit,
        cpu_extra_time: executionSettings.cpu_extra_time || 2,
        wall_time_limit: wallTimeLimit, 
        memory_limit: executionSettings.memory_limit || 512000,
        compilation_time_limit: compTimeLimit
      }));
      

      // Create batch submission (temporarily without base64_encoded parameter)
      const batchRes = await fetch(`${JUDGE0_API_URL}/submissions/batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ submissions }),
      });

      if (!batchRes.ok) {
        const errorText = await batchRes.text();
        console.error(`Judge0 batch submission error for batch ${batchIndex + 1}:`, errorText);
        
        // Try without base64 encoding as a fallback
        console.log('Trying batch submission without base64 encoding...');
        const submissionsPlain = batchTestCases.map(testCase => ({
          source_code: sourceCode, // No encoding
          language_id: languageId,
          stdin: testCase.input, // No encoding
          expected_output: testCase.expectedOutput, // No encoding
          cpu_time_limit: cpuTimeLimit,
          cpu_extra_time: executionSettings.cpu_extra_time || 2,
          wall_time_limit: wallTimeLimit, 
          memory_limit: executionSettings.memory_limit || 512000,
          compilation_time_limit: compTimeLimit
        }));

        const plainRes = await fetch(`${JUDGE0_API_URL}/submissions/batch`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ submissions: submissionsPlain }),
        });

        if (plainRes.ok) {
          console.log('Plain text submission succeeded, continuing with non-base64 approach...');
          // Handle the plain response (without base64 decoding later)
          // Update the batch tokens processing to not expect base64 encoded responses
          const batchTokens = await plainRes.json();
          if (!batchTokens || !Array.isArray(batchTokens) || batchTokens.length === 0) {
            throw new Error('Invalid response from Judge0 batch submission');
          }
          
          // Extract tokens
          const tokens = batchTokens.map((item: any) => item.token);
          if (tokens.some((token: any) => !token)) {
            throw new Error('Some tokens are missing in the batch response');
          }
          
          // Poll for results without base64 decoding
          const maxAttempts = 40;
          const pollingInterval = 1500;
          let attempts = 0;
          let batchDone = false;

          while (!batchDone && attempts < maxAttempts) {
            attempts++;
            await new Promise(resolve => setTimeout(resolve, pollingInterval));

            // Poll for batch status (temporarily without base64_encoded parameter)
            const batchStatusRes = await fetch(`${JUDGE0_API_URL}/submissions/batch?tokens=${tokens.join(',')}`, {
              headers: {
                "Content-Type": "application/json"
              }
            });

            if (!batchStatusRes.ok) {
              console.error(`Error polling batch ${batchIndex + 1} status:`, await batchStatusRes.text());
              continue;
            }

            const batchStatus = await batchStatusRes.json();
            if (!batchStatus || !batchStatus.submissions) {
              console.error('Invalid batch status response');
              continue;
            }

            // Update results with the latest status (temporarily no base64 decoding)
            let batchCompletedCount = 0;
            batchStatus.submissions.forEach((submission: any, idx: number) => {
              const globalIdx = startIdx + idx;
              
              // Temporarily no base64 decoding since we disabled encoding
              // if (submission.stdout) submission.stdout = base64Decode(submission.stdout);
              // if (submission.stderr) submission.stderr = base64Decode(submission.stderr);
              // if (submission.compile_output) submission.compile_output = base64Decode(submission.compile_output);
              // if (submission.message) submission.message = base64Decode(submission.message);

              // Update result if execution is done (status ID 3 or higher)
              if (submission.status && submission.status.id >= 3) {
                batchCompletedCount++;
                let verdict = "Unknown";
                let isCorrect = false;
                
                // Get stdout from the API response (may be null)
                const stdout = submission.stdout;
                
                if (submission.status.id === 3) {
                  // Safety check to ensure values exist and are strings before trim()
                  const stdoutStr = typeof stdout === 'string' ? stdout.trim() : '';
                  const expectedStr = typeof batchTestCases[idx].expectedOutput === 'string' ? batchTestCases[idx].expectedOutput.trim() : '';
                  isCorrect = (stdoutStr === expectedStr);
                  verdict = isCorrect ? "Accepted" : "Wrong Answer";
                  
                  // If this test case failed, set the flag
                  if (!isCorrect) {
                    hasFailedTestCase = true;
                  }
                } else {
                  // Use the standardized verdict function for other status codes
                  verdict = getVerdict(submission.status.id);
                  hasFailedTestCase = true;
                }

                // Special handling for time limit exceeded
                if (submission.status.id === Judge0StatusCode.TIME_LIMIT_EXCEEDED) {
                  verdict = "Time Limit Exceeded";
                  hasFailedTestCase = true;
                }
                // Special handling for compile errors
                else if (submission.status.id === Judge0StatusCode.COMPILATION_ERROR) {
                  verdict = "Compilation Error";
                  hasFailedTestCase = true;
                }
                // Special handling for runtime errors with stderr
                else if (submission.stderr && submission.stderr.trim() !== '' && verdict !== "Compilation Error") {
                  if (![7, 8, 9, 10, 11, 12].includes(submission.status.id)) {
                    verdict = "Runtime Error";
                  }
                  hasFailedTestCase = true;
                }

                // Update the result
                results[globalIdx] = {
                  input: batchTestCases[idx].input,
                  expected: batchTestCases[idx].expectedOutput,
                  output: stdout,
                  stderr: submission.stderr,
                  compile_output: submission.compile_output,
                  status: submission.status,
                  verdict,
                  time: submission.time,
                  memory: submission.memory,
                  isCorrect,
                  isSkipped: submission.status && submission.status.description === "Skipped"
                };
              }
            });

            // If we have a progress callback, call it with current results
            completedCount = results.filter(r => r.verdict !== "In Queue").length;
            if (progressCallback) {
              progressCallback(results, completedCount);
            }

            // Check if all submissions in this batch are done
            batchDone = batchCompletedCount === batchTestCases.length;
            if (batchDone) {
              break;
            }
          }
          
          // Continue to next batch
          continue;
        } else {
          console.error('Both base64 and plain text submissions failed');
        }
        
        // Fall back to sequential for this batch
        const batchResults = await runWithJudge0Sequential({
          sourceCode, 
          languageId, 
          testCases: batchTestCases,
          progressCallback: undefined,
          executionSettings: {
            ...executionSettings,
            wall_time_limit: wallTimeLimit,
            cpu_time_limit: cpuTimeLimit,
            compilation_time_limit: compTimeLimit
          }
        });
        
        // Copy results to the main results array
        batchResults.forEach((result, idx) => {
          const globalIdx = startIdx + idx;
          results[globalIdx] = result;
          
          // Check if this test case failed
          if (result.status.id !== 3 || 
              (typeof result.output === 'string' && result.output.trim() !== testCases[startIdx + idx].expectedOutput.trim())) {
            hasFailedTestCase = true;
          }
        });
        
        // Update completed count
        completedCount += batchTestCases.length;
        
        // Call progress callback
        if (progressCallback) {
          progressCallback(results, completedCount);
        }
        
        continue;
      }

      // Get tokens from batch response
      const batchTokens = await batchRes.json();
      if (!batchTokens || !Array.isArray(batchTokens) || batchTokens.length === 0) {
        throw new Error('Invalid response from Judge0 batch submission');
      }

      // Extract tokens
      const tokens = batchTokens.map(item => item.token);
      if (tokens.some(token => !token)) {
        throw new Error('Some tokens are missing in the batch response');
      }

      // Poll for results with longer timeout for compilation
      const maxAttempts = 40;
      const pollingInterval = 1500;
      let attempts = 0;
      let batchDone = false;

      while (!batchDone && attempts < maxAttempts) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, pollingInterval));

        // Poll for batch status (temporarily without base64_encoded parameter)
        const batchStatusRes = await fetch(`${JUDGE0_API_URL}/submissions/batch?tokens=${tokens.join(',')}`, {
          headers: {
            "Content-Type": "application/json"
          }
        });

        if (!batchStatusRes.ok) {
          console.error(`Error polling batch ${batchIndex + 1} status:`, await batchStatusRes.text());
          continue;
        }

        const batchStatus = await batchStatusRes.json();
        if (!batchStatus || !batchStatus.submissions) {
          console.error('Invalid batch status response');
          continue;
        }

        // Update results with the latest status (temporarily no base64 decoding)
        let batchCompletedCount = 0;
        batchStatus.submissions.forEach((submission: any, idx: number) => {
          const globalIdx = startIdx + idx;
          
          // Temporarily no base64 decoding since we disabled encoding
          // if (submission.stdout) submission.stdout = base64Decode(submission.stdout);
          // if (submission.stderr) submission.stderr = base64Decode(submission.stderr);
          // if (submission.compile_output) submission.compile_output = base64Decode(submission.compile_output);
          // if (submission.message) submission.message = base64Decode(submission.message);

          // Update result if execution is done (status ID 3 or higher)
          if (submission.status && submission.status.id >= 3) {
            batchCompletedCount++;
            let verdict = "Unknown";
            let isCorrect = false;
            
            // Get stdout from the API response (may be null)
            const stdout = submission.stdout;
            
            if (submission.status.id === 3) {
              // Safety check to ensure values exist and are strings before trim()
              const stdoutStr = typeof stdout === 'string' ? stdout.trim() : '';
              const expectedStr = typeof batchTestCases[idx].expectedOutput === 'string' ? batchTestCases[idx].expectedOutput.trim() : '';
              isCorrect = (stdoutStr === expectedStr);
              verdict = isCorrect ? "Accepted" : "Wrong Answer";
              
              // If this test case failed, set the flag
              if (!isCorrect) {
                hasFailedTestCase = true;
              }
            } else {
              // Use the standardized verdict function for other status codes
              verdict = getVerdict(submission.status.id);
              hasFailedTestCase = true;
            }

            // Special handling for time limit exceeded
            if (submission.status.id === Judge0StatusCode.TIME_LIMIT_EXCEEDED) {
              verdict = "Time Limit Exceeded";
              hasFailedTestCase = true;
            }
            // Special handling for compile errors
            else if (submission.status.id === Judge0StatusCode.COMPILATION_ERROR) {
              verdict = "Compilation Error";
              hasFailedTestCase = true;
            }
            // Special handling for runtime errors with stderr
            else if (submission.stderr && submission.stderr.trim() !== '' && verdict !== "Compilation Error") {
              if (![7, 8, 9, 10, 11, 12].includes(submission.status.id)) {
                verdict = "Runtime Error";
              }
              hasFailedTestCase = true;
            }

            // Update the result
            results[globalIdx] = {
              input: batchTestCases[idx].input,
              expected: batchTestCases[idx].expectedOutput,
              output: stdout,
              stderr: submission.stderr,
              compile_output: submission.compile_output,
              status: submission.status,
              verdict,
              time: submission.time,
              memory: submission.memory,
              isCorrect,
              isSkipped: submission.status && submission.status.description === "Skipped"
            };
          }
        });

        // If we have a progress callback, call it with current results
        completedCount = results.filter(r => r.verdict !== "In Queue").length;
        if (progressCallback) {
          progressCallback(results, completedCount);
        }

        // Check if all submissions in this batch are done
        batchDone = batchCompletedCount === batchTestCases.length;
        if (batchDone) {
          break;
        }
      }

      // If we still have pending test cases in this batch after max attempts,
      // fall back to sequential execution for those
      const pendingIndices = batchTestCases.map((_, idx) => {
        const globalIdx = startIdx + idx;
        return results[globalIdx].verdict === "In Queue" ? idx : -1;
      }).filter(idx => idx !== -1);

      if (pendingIndices.length > 0) {
        
        for (const idx of pendingIndices) {
          const globalIdx = startIdx + idx;
          const singleTestCase = [batchTestCases[idx]];
          
          try {
            const singleResult = await runWithJudge0Sequential({
              sourceCode,
              languageId,
              testCases: singleTestCase,
              progressCallback: undefined,
              executionSettings: {
                ...executionSettings,
                wall_time_limit: wallTimeLimit,
                cpu_time_limit: cpuTimeLimit,
                compilation_time_limit: compTimeLimit
              }
            });
            
            if (singleResult && singleResult.length > 0) {
              results[globalIdx] = singleResult[0];
              
              // Check if this test case failed
              if (singleResult[0].status.id !== 3 || 
                  (singleResult[0].verdict !== "Accepted")) {
                hasFailedTestCase = true;
              }
              
              // Update progress if callback provided
              completedCount = results.filter(r => r.verdict !== "In Queue").length;
              if (progressCallback) {
                progressCallback(results, completedCount);
              }
            }
          } catch (retryError) {
            console.error(`Error retrying test case ${globalIdx}:`, retryError);
            
            // Mark as failed if we couldn't process it
            results[globalIdx] = {
              input: batchTestCases[idx].input,
              expected: batchTestCases[idx].expectedOutput,
              output: null,
              stderr: `Failed to process: ${retryError}`,
              compile_output: null,
              status: { id: 13, description: "Runtime Error" },
              verdict: "Processing Failed",
            };
            
            // Set the failure flag
            hasFailedTestCase = true;
          }
        }
      }
    } catch (error) {
      console.error(`Error processing batch ${batchIndex + 1}:`, error);
      
      // Fall back to sequential for this batch
      const batchResults = await runWithJudge0Sequential({
        sourceCode,
        languageId,
        testCases: batchTestCases,
        progressCallback: undefined,
        executionSettings: {
          ...executionSettings,
          wall_time_limit: wallTimeLimit,
          cpu_time_limit: cpuTimeLimit,
          compilation_time_limit: compTimeLimit
        }
      });
      
      // Copy results to the main results array
      batchResults.forEach((result, idx) => {
        const globalIdx = startIdx + idx;
        results[globalIdx] = result;
        
        // Check if this test case failed
        if (result.status.id !== 3 || 
            (typeof result.output === 'string' && result.output.trim() !== testCases[startIdx + idx].expectedOutput.trim())) {
          hasFailedTestCase = true;
        }
      });
      
      // Update completed count
      completedCount += batchTestCases.length;
      
      // Call progress callback
      if (progressCallback) {
        progressCallback(results, completedCount);
      }
    }
  }
  
  return results
}

// Enhanced batch execution with real-time individual test case updates
export async function runWithJudge0BatchRealtime({
  sourceCode,
  languageId,
  testCases,
  progressCallback,
  executionSettings = {}
}: {
  sourceCode: string
  languageId: number
  testCases: Judge0TestCase[]
  progressCallback?: ((results: Judge0Result[], index: number) => void) | undefined
  executionSettings?: {
    cpu_time_limit?: number;
    cpu_extra_time?: number;
    wall_time_limit?: number;
    memory_limit?: number;
    stack_limit?: number;
    compilation_time_limit?: number;
    max_file_size?: number;
    max_processes_and_or_threads?: number;
  }
}): Promise<Judge0Result[]> {
  const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
  
  // Set reasonable limits for Judge0
  const wallTimeLimit = Math.min(executionSettings.wall_time_limit || 10, 20);
  const cpuTimeLimit = Math.min(executionSettings.cpu_time_limit || 5, 15);
  const compTimeLimit = Math.min(executionSettings.compilation_time_limit || 30, 30);

  // Initialize results array
  const results: Judge0Result[] = testCases.map((testCase) => ({
    input: testCase.input,
    expected: testCase.expectedOutput,
    output: null,
    stderr: null,
    compile_output: null,
    status: { id: 1, description: "In Queue" },
    verdict: "In Queue",
    isCorrect: false
  }));

  try {
    // Submit all test cases as individual submissions for better tracking
    const submissions = [];
    
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      
      const submissionData = {
        source_code: base64Encode(sourceCode),
        language_id: getUpdatedLanguageId(languageId),
        stdin: base64Encode(testCase.input),
        expected_output: base64Encode(testCase.expectedOutput),
        cpu_time_limit: cpuTimeLimit,
        cpu_extra_time: 0.5,
        wall_time_limit: wallTimeLimit,
        memory_limit: executionSettings.memory_limit || 128000,
        stack_limit: executionSettings.stack_limit || 64000,
        max_processes_and_or_threads: executionSettings.max_processes_and_or_threads || 60,
        enable_per_process_and_thread_time_limit: false,
        enable_per_process_and_thread_memory_limit: false,
        max_file_size: executionSettings.max_file_size || 1024,
        compilation_time_limit: compTimeLimit,
        wait: false
      };

      const response = await fetch(`${JUDGE0_API_URL}/submissions`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(submissionData)
      });

      if (!response.ok) {
        throw new Error(`Failed to submit test case ${i + 1}: ${response.statusText}`);
      }

      const submission = await response.json();
      submissions.push({ token: submission.token, index: i });
    }

    // Poll individual submissions for real-time updates
    const maxAttempts = 80;
    const pollingInterval = 500; // Very fast polling for real-time feel
    let attempts = 0;
    let completedCount = 0;

    while (completedCount < testCases.length && attempts < maxAttempts) {
      attempts++;
      await new Promise(resolve => setTimeout(resolve, pollingInterval));

      // Check each submission individually
      for (const submission of submissions) {
        const { token, index } = submission;
        
        // Skip if already completed
        if (results[index].status.id >= 3) continue;

        try {
          const statusRes = await fetch(`${JUDGE0_API_URL}/submissions/${token}`, {
            headers: {
              "Content-Type": "application/json"
            }
          });

          if (!statusRes.ok) continue;

          const status = await statusRes.json();
          
          // Temporarily no base64 decoding since we disabled encoding
          // if (status.stdout) status.stdout = base64Decode(status.stdout);
          // if (status.stderr) status.stderr = base64Decode(status.stderr);
          // if (status.compile_output) status.compile_output = base64Decode(status.compile_output);
          // if (status.message) status.message = base64Decode(status.message);

          // Update result if status changed
          if (status.status && status.status.id !== results[index].status.id) {
            let verdict = "Unknown";
            let isCorrect = false;

            if (status.status.id === 1) {
              verdict = "In Queue";
            } else if (status.status.id === 2) {
              verdict = "Processing";
            } else if (status.status.id >= 3) {
              // Execution completed
              if (status.status.id === 3) {
                const stdoutStr = typeof status.stdout === 'string' ? status.stdout.trim() : '';
                const expectedStr = typeof testCases[index].expectedOutput === 'string' ? testCases[index].expectedOutput.trim() : '';
                isCorrect = (stdoutStr === expectedStr);
                verdict = isCorrect ? "Accepted" : "Wrong Answer";
              } else {
                verdict = getVerdict(status.status.id);
              }

              // Special handling for specific error types
              if (status.status.id === Judge0StatusCode.TIME_LIMIT_EXCEEDED) {
                verdict = "Time Limit Exceeded";
              } else if (status.status.id === Judge0StatusCode.COMPILATION_ERROR) {
                verdict = "Compilation Error";
              } else if (status.stderr && status.stderr.trim() !== '' && verdict !== "Compilation Error") {
                if (![7, 8, 9, 10, 11, 12].includes(status.status.id)) {
                  verdict = "Runtime Error";
                }
              }

              // Count as completed
              if (results[index].status.id < 3) {
                completedCount++;
              }
            }

            // Update the result
            results[index] = {
              input: testCases[index].input,
              expected: testCases[index].expectedOutput,
              output: status.status.id >= 3 ? status.stdout : null,
              stderr: status.stderr,
              compile_output: status.compile_output,
              status: status.status,
              verdict,
              time: status.time,
              memory: status.memory,
              isCorrect,
              isSkipped: status.status && status.status.description === "Skipped"
            };

            // Call progress callback immediately when a test case completes
            if (progressCallback && status.status.id >= 3) {
              progressCallback(results, completedCount);
            }
          }
        } catch (error) {
          console.error(`Error polling submission ${token}:`, error);
        }
      }

      // Also call progress callback for status updates (Processing, etc.)
      if (progressCallback && attempts % 3 === 0) { // Every 3rd attempt to avoid spam
        progressCallback(results, completedCount);
      }
    }

    // Handle any remaining incomplete submissions
    for (let i = 0; i < results.length; i++) {
      if (results[i].status.id < 3) {
        results[i] = {
          ...results[i],
          verdict: "Time Limit Exceeded",
          status: { id: 5, description: "Time Limit Exceeded" }
        };
      }
    }

    return results;

  } catch (error) {
    console.error('Error in real-time batch execution:', error);
    
    // Fallback to sequential execution
    return await runWithJudge0Sequential({
      sourceCode,
      languageId,
      testCases,
      progressCallback,
      executionSettings
    });
  }
}

// Add this at the end of the file to export runWithJudge0
export async function runWithJudge0({
  sourceCode,
  languageId,
  testCases,
  progressCallback,
  forceBatch = false,
  forceSequential = false,
  executionSettings = {}
}: {
  sourceCode: string
  languageId: number
  testCases: Judge0TestCase[]
  progressCallback?: ((results: Judge0Result[], index: number) => void) | undefined
  forceBatch?: boolean
  forceSequential?: boolean
  executionSettings?: {
    cpu_time_limit?: number;
    cpu_extra_time?: number;
    wall_time_limit?: number;
    memory_limit?: number;
    stack_limit?: number;
    compilation_time_limit?: number;
    max_file_size?: number;
    max_processes_and_or_threads?: number;
  }
}): Promise<Judge0Result[]> {
  if (forceBatch) {
    return runWithJudge0BatchRealtime({ sourceCode, languageId, testCases, progressCallback, executionSettings });
  } else if (forceSequential) {
    return runWithJudge0Sequential({ sourceCode, languageId, testCases, progressCallback, executionSettings });
  } else {
    // Default: use real-time batch for multiple test cases, sequential for one
    if (testCases.length > 1) {
      return runWithJudge0BatchRealtime({ sourceCode, languageId, testCases, progressCallback, executionSettings });
    } else {
      return runWithJudge0Sequential({ sourceCode, languageId, testCases, progressCallback, executionSettings });
    }
  }
} 