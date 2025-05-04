const JUDGE0_API_URL = "http://128.199.24.150:2358"
const JUDGE0_API_KEY = process.env.NEXT_PUBLIC_JUDGE0_API_KEY

console.log('Using self-hosted Judge0 at:', JUDGE0_API_URL)
console.log('Judge0 API Key available:', Boolean(JUDGE0_API_KEY))

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
}

// Fallback execution method when Judge0 API is unavailable
async function localFallbackExecution(
  sourceCode: string, 
  language: number, 
  testCases: Judge0TestCase[]
): Promise<Judge0Result[]> {
  console.log('Using local fallback execution')
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
        // For non-JS languages, just simulate results
        results.push({
          input: testCase.input,
          expected: testCase.expectedOutput,
          output: "Simulated output (API unavailable)",
          stderr: null,
          compile_output: "Local execution not available for this language. Please subscribe to Judge0 API.",
          status: { id: 6, description: "Unavailable" },
          verdict: "API Subscription Required"
        })
      }
    } catch (e: any) {
      results.push({
        input: testCase.input,
        expected: testCase.expectedOutput,
        output: null,
        stderr: e.toString(),
        compile_output: "Error in local fallback execution",
        status: { id: 13, description: "Runtime Error" },
        verdict: "Runtime Error"
      })
    }
  }
  
  return results
}

export async function runWithJudge0({
  sourceCode,
  languageId,
  testCases,
}: {
  sourceCode: string
  languageId: number
  testCases: Judge0TestCase[]
}): Promise<Judge0Result[]> {
  console.log(`Starting Judge0 execution for language ID: ${languageId}`)
  console.log(`Number of test cases: ${testCases.length}`)
  
  // Check for empty code submission or just comments
  const trimmedCode = sourceCode.trim();
  
  // First check if code is completely empty
  if (!trimmedCode) {
    return testCases.map(tc => ({
      input: tc.input,
      expected: tc.expectedOutput,
      output: null,
      stderr: "Empty code submission",
      compile_output: null,
      status: { id: 13, description: "Runtime Error" },
      verdict: "Empty Code"
    }));
  }
  
  // Then check if code only contains comments
  const commentOnlyRegex = /^(\s*(\/\/.*|\/\*[\s\S]*?\*\/|#.*)\s*)*$/;
  if (commentOnlyRegex.test(trimmedCode)) {
    return testCases.map(tc => ({
      input: tc.input,
      expected: tc.expectedOutput,
      output: null,
      stderr: "Your code only contains comments",
      compile_output: null,
      status: { id: 13, description: "Runtime Error" },
      verdict: "Comments Only"
    }));
  }
  
  // First check if we need to update the language ID
  const updatedLanguageId = getUpdatedLanguageId(languageId);
  if (updatedLanguageId !== languageId) {
    console.log(`Updated deprecated language ID ${languageId} to ${updatedLanguageId}`);
    languageId = updatedLanguageId;
  }
  
  const results: Judge0Result[] = []
  try {
    for (const testCase of testCases) {
      console.log('Submitting test case:', { input: testCase.input.substring(0, 50) + '...' })
      // 1. Submit code
      const submissionRes = await fetch(`${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=false`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source_code: sourceCode,
          language_id: languageId,
          stdin: testCase.input,
          expected_output: testCase.expectedOutput,
        }),
      })
      if (!submissionRes.ok) {
        const errorText = await submissionRes.text()
        console.error('Judge0 submission error:', errorText)
        
        // Check if this is a subscription error
        if (errorText.includes("not subscribed") || errorText.includes("subscription")) {
          console.log("Subscription error detected, using fallback execution")
          return localFallbackExecution(sourceCode, languageId, testCases)
        }
        
        // Check if this is an archived language error
        if (errorText.includes("archived") || errorText.includes("cannot be used anymore")) {
          console.error("Language ID is archived. Please update the language mapping.")
          // Show clear error to the user
          results.push({
            input: testCase.input,
            expected: testCase.expectedOutput,
            output: null,
            stderr: null,
            compile_output: `The selected language version is no longer supported by the Judge0 API. 
Please update the languageId mapping to use a current version.
Original error: ${errorText}`,
            status: { id: 6, description: "Language Deprecated" },
            verdict: "Language Deprecated"
          });
          continue; // Try the next test case
        }
        
        throw new Error(`Judge0 API error: ${submissionRes.status} ${errorText}`)
      }
      const submission = await submissionRes.json()
      console.log('Submission response:', submission)
      const { token } = submission
      if (!token) {
        throw new Error('No token in Judge0 response')
      }

      // 2. Poll for result
      let result
      let attemptsLeft = 20
      console.log('Polling for results with token:', token)
      while (attemptsLeft > 0) {
        await new Promise((r) => setTimeout(r, 1500))
        try {
          const res = await fetch(`${JUDGE0_API_URL}/submissions/${token}?base64_encoded=false`, {
            headers: {
              "Content-Type": "application/json"
            },
          })
          if (!res.ok) {
            console.error('Error fetching result:', await res.text())
            throw new Error(`Error fetching result: ${res.status}`)
          }
          result = await res.json()
          console.log('Poll result:', { status: result.status, stdout: result.stdout?.substring(0, 50) })
          if (result.status?.id >= 3) break // 3+ means finished
        } catch (e) {
          console.error('Error during polling:', e)
        }
        attemptsLeft--
      }
      
      // Handle timeout case (no result after polling attempts)
      if (!result) {
        console.warn("Execution timeout detected - possibly an infinite loop or very slow code")
        results.push({
          input: testCase.input,
          expected: testCase.expectedOutput,
          output: null,
          stderr: "Execution timed out - possibly contains an infinite loop or is very computationally intensive",
          compile_output: null,
          status: { id: 11, description: "Time Limit Exceeded" },
          verdict: "Time Limit Exceeded"
        });
        continue; // Move to next test case
      }

      // 3. Map status to verdict
      let verdict = "Unknown"
      if (result.status.id === 3) {
        verdict = (result.stdout?.trim() === testCase.expectedOutput.trim()) ? "Accepted" : "Wrong Answer"
      } else if (result.status.id === 4) {
        verdict = "Wrong Answer"
      } else if (result.status.id === 5) {
        verdict = "Memory Limit Exceeded"
      } else if (result.status.id === 6) {
        verdict = "Compile Error"
      } else if (result.status.id === 11) {
        verdict = "Time Limit Exceeded"
      } else if (result.status.id === 13) {
        verdict = "Runtime Error"
      }
      // --- Ensure compile errors are always mapped correctly ---
      if (result.compile_output) {
        verdict = "Compile Error";
      } else if (result.stderr && verdict !== "Compile Error") {
        verdict = "Runtime Error";
      }
      // --- End robust mapping ---
      console.log('Final verdict:', verdict)

      results.push({
        input: testCase.input,
        expected: testCase.expectedOutput,
        output: result.stdout,
        stderr: result.stderr,
        compile_output: result.compile_output,
        status: result.status,
        verdict,
      })
    }
    return results
  } catch (error) {
    console.error('Judge0 execution error:', error)
    
    // If there was an error starting the API or with the first few calls,
    // fall back to local execution
    if (results.length === 0) {
      return localFallbackExecution(sourceCode, languageId, testCases)
    }
    
    throw error
  }
} 