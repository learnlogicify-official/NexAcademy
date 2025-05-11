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
  return Buffer.from(str).toString('base64');
}

function base64Decode(str: string): string {
  try {
    return Buffer.from(str, 'base64').toString('utf-8');
  } catch (error) {
    console.error('Error decoding base64:', error);
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
            status: { id: 3, description: "Accepted" },
            verdict: passed ? "Accepted" : "Wrong Answer"
          })
        } catch (error: any) {
          results.push({
            input: testCase.input,
            expected: testCase.expectedOutput,
            output: null,
            stderr: error.toString(),
            compile_output: null,
            status: { id: 13, description: "Runtime Error" },
            verdict: "Runtime Error"
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
          status: { id: 6, description: "Unavailable" },
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
  const wallTimeLimit = Math.min(executionSettings.wall_time_limit || 5, 5); // Max 20 seconds allowed
  const cpuTimeLimit = Math.min(executionSettings.cpu_time_limit || 2, 2);  // Max 15 seconds
  const compTimeLimit = Math.min(executionSettings.compilation_time_limit || 5, 5); // Max 20 seconds

  // Log the settings we're using
  console.log(`Using Judge0 settings - wallTimeLimit: ${wallTimeLimit}s, cpuTimeLimit: ${cpuTimeLimit}s, compTimeLimit: ${compTimeLimit}s`);

  // Batch processing works best with small batches of 8 test cases max
  const maxBatchSize = 8;
  const batches = [];
  
  for (let i = 0; i < testCases.length; i += maxBatchSize) {
    batches.push(testCases.slice(i, i + maxBatchSize));
  }
  
  console.log(`Processing ${testCases.length} test cases in ${batches.length} batches of max ${maxBatchSize} each`);
  
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
      console.log(`Skipping batch ${batchIndex + 1}/${batches.length} due to previous failure`);
      
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
      
      console.log(`Submitting batch ${batchIndex + 1}/${batches.length} with ${submissions.length} test cases`);

      // Create batch submission
      const batchRes = await fetch(`${JUDGE0_API_URL}/submissions/batch?base64_encoded=true`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ submissions }),
      });

      if (!batchRes.ok) {
        const errorText = await batchRes.text();
        console.error(`Judge0 batch submission error for batch ${batchIndex + 1}:`, errorText);
        
        // Fall back to sequential for this batch
        console.log(`Falling back to sequential execution for batch ${batchIndex + 1}`);
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

        // Poll for batch status
        const batchStatusRes = await fetch(`${JUDGE0_API_URL}/submissions/batch?tokens=${tokens.join(',')}&base64_encoded=true`, {
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

        // Update results with the latest status
        let batchCompletedCount = 0;
        batchStatus.submissions.forEach((submission: any, idx: number) => {
          const globalIdx = startIdx + idx;
          
          // Decode base64 fields if they exist
          if (submission.stdout) submission.stdout = base64Decode(submission.stdout);
          if (submission.stderr) submission.stderr = base64Decode(submission.stderr);
          if (submission.compile_output) submission.compile_output = base64Decode(submission.compile_output);
          if (submission.message) submission.message = base64Decode(submission.message);

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
            } else if (submission.status.id === 4) {
              verdict = "Wrong Answer";
              hasFailedTestCase = true;
            } else if (submission.status.id === 5) {
              verdict = "Memory Limit Exceeded";
              hasFailedTestCase = true;
            } else if (submission.status.id === 6) {
              verdict = "Compile Error";
              hasFailedTestCase = true;
            } else if (submission.status.id === 11) {
              verdict = "Time Limit Exceeded";
              hasFailedTestCase = true;
            } else if (submission.status.id === 13) {
              verdict = "Runtime Error";
              hasFailedTestCase = true;
            }

            // Ensure compile errors are always mapped correctly
            if (submission.compile_output) {
              verdict = "Compile Error";
              hasFailedTestCase = true;
            } else if (submission.stderr && verdict !== "Compile Error") {
              verdict = "Runtime Error";
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
          console.log(`Batch ${batchIndex + 1}/${batches.length} completed`);
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
        console.log(`Falling back to sequential execution for ${pendingIndices.length} pending test cases in batch ${batchIndex + 1}`);
        
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
      console.log(`Falling back to sequential execution for batch ${batchIndex + 1}`);
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
  const wallTimeLimit = Math.min(executionSettings.wall_time_limit || 20, 20); // Max 20 seconds allowed
  const cpuTimeLimit = Math.min(executionSettings.cpu_time_limit || 10, 15);  // Max 15 seconds
  const compTimeLimit = Math.min(executionSettings.compilation_time_limit || 20, 20); // Max 20 seconds

  // Log the settings we're using
  console.log(`Using Judge0 settings - wallTimeLimit: ${wallTimeLimit}s, cpuTimeLimit: ${cpuTimeLimit}s, compTimeLimit: ${compTimeLimit}s`);

  // Batch processing works best with small batches of 8 test cases max
  const maxBatchSize = 8;
  const batches = [];
  
  for (let i = 0; i < testCases.length; i += maxBatchSize) {
    batches.push(testCases.slice(i, i + maxBatchSize));
  }
  
  console.log(`Processing ${testCases.length} test cases in ${batches.length} batches of max ${maxBatchSize} each`);
  
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
      console.log(`Skipping batch ${batchIndex + 1}/${batches.length} due to previous failure`);
      
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
      
      console.log(`Submitting batch ${batchIndex + 1}/${batches.length} with ${submissions.length} test cases`);

      // Create batch submission
      const batchRes = await fetch(`${JUDGE0_API_URL}/submissions/batch?base64_encoded=true`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ submissions }),
      });

      if (!batchRes.ok) {
        const errorText = await batchRes.text();
        console.error(`Judge0 batch submission error for batch ${batchIndex + 1}:`, errorText);
        
        // Fall back to sequential for this batch
        console.log(`Falling back to sequential execution for batch ${batchIndex + 1}`);
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

        // Poll for batch status
        const batchStatusRes = await fetch(`${JUDGE0_API_URL}/submissions/batch?tokens=${tokens.join(',')}&base64_encoded=true`, {
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

        // Update results with the latest status
        let batchCompletedCount = 0;
        batchStatus.submissions.forEach((submission: any, idx: number) => {
          const globalIdx = startIdx + idx;
          
          // Decode base64 fields if they exist
          if (submission.stdout) submission.stdout = base64Decode(submission.stdout);
          if (submission.stderr) submission.stderr = base64Decode(submission.stderr);
          if (submission.compile_output) submission.compile_output = base64Decode(submission.compile_output);
          if (submission.message) submission.message = base64Decode(submission.message);

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
            } else if (submission.status.id === 4) {
              verdict = "Wrong Answer";
              hasFailedTestCase = true;
            } else if (submission.status.id === 5) {
              verdict = "Memory Limit Exceeded";
              hasFailedTestCase = true;
            } else if (submission.status.id === 6) {
              verdict = "Compile Error";
              hasFailedTestCase = true;
            } else if (submission.status.id === 11) {
              verdict = "Time Limit Exceeded";
              hasFailedTestCase = true;
            } else if (submission.status.id === 13) {
              verdict = "Runtime Error";
              hasFailedTestCase = true;
            }

            // Ensure compile errors are always mapped correctly
            if (submission.compile_output) {
              verdict = "Compile Error";
              hasFailedTestCase = true;
            } else if (submission.stderr && verdict !== "Compile Error") {
              verdict = "Runtime Error";
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
          console.log(`Batch ${batchIndex + 1}/${batches.length} completed`);
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
        console.log(`Falling back to sequential execution for ${pendingIndices.length} pending test cases in batch ${batchIndex + 1}`);
        
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
      console.log(`Falling back to sequential execution for batch ${batchIndex + 1}`);
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
    return runWithJudge0Batch({ sourceCode, languageId, testCases, progressCallback, executionSettings });
  } else if (forceSequential) {
    return runWithJudge0Sequential({ sourceCode, languageId, testCases, progressCallback, executionSettings });
  } else {
    // Default: use batch for multiple test cases, sequential for one
    if (testCases.length > 1) {
      return runWithJudge0Batch({ sourceCode, languageId, testCases, progressCallback, executionSettings });
    } else {
      return runWithJudge0Sequential({ sourceCode, languageId, testCases, progressCallback, executionSettings });
    }
  }
} 