import { NextRequest, NextResponse } from 'next/server';

// Use Judge0 Extra CE for the most languages
const JUDGE0_LANGUAGES_URL = 'https://extra-ce.judge0.com/languages/';

// In-memory cache for languages
let cachedLanguages: any[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Helper to fetch languages (can be imported elsewhere)
export async function fetchJudge0Languages() {
  const now = Date.now();
  if (cachedLanguages && now - cacheTimestamp < CACHE_DURATION) {
    return cachedLanguages;
  }
  const response = await fetch(JUDGE0_LANGUAGES_URL);
  if (!response.ok) throw new Error('Failed to fetch Judge0 languages');
  const data = await response.json();
  cachedLanguages = data;
  cacheTimestamp = now;
  return data;
}

export async function GET() {
  try {
    const languages = await fetchJudge0Languages();
    return NextResponse.json({ success: true, data: languages });
  } catch (error) {
    console.error('Error fetching Judge0 languages:', error);
    return NextResponse.json({
      error: 'Error accessing Judge0 Extra CE languages',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

const JUDGE0_API_URL = process.env.NEXT_PUBLIC_JUDGE0_API_URL || "https://judge0-ce.p.rapidapi.com";
const JUDGE0_API_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;
const JUDGE0_API_HOST = process.env.NEXT_PUBLIC_JUDGE0_API_HOST || "judge0-ce.p.rapidapi.com";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();

    
    if (!body.language_id || !body.source_code) {
      return NextResponse.json({ 
        error: "Missing required fields: language_id or source_code"
      }, { status: 400 });
    }

    // Check if API key is available
    if (!JUDGE0_API_KEY) {
      console.error("Judge0 API key is missing");
      return NextResponse.json({ 
        error: "Judge0 API key is not configured"
      }, { status: 500 });
    }
    
    // Forward the request to Judge0
    const requestBody = {
      language_id: body.language_id,
      source_code: body.source_code,
      stdin: body.stdin || "",
      wait: true
    };
    

    
    // Increase delay to prevent rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    let response;
    try {
      response = await fetch(`${JUDGE0_API_URL}/submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": JUDGE0_API_KEY,
          "X-RapidAPI-Host": JUDGE0_API_HOST
        },
        body: JSON.stringify(requestBody)
      });
    } catch (networkError) {
      console.error("Network error connecting to Judge0 API:", networkError);
      return NextResponse.json({ 
        error: "Failed to connect to Judge0 API",
        details: networkError instanceof Error ? networkError.message : String(networkError)
      }, { status: 500 });
    }
    
    
    
    if (!response.ok) {
      console.error("Server-side Judge0 API error:", response.status, response.statusText);
      let errorText = "";
      try {
        errorText = await response.text();
        console.error("Error details:", errorText);
      } catch (e) {
        console.error("Could not read error response text:", e);
      }
      
      // Handle rate limiting specifically
      if (response.status === 429) {
        return NextResponse.json({ 
          error: "Rate limit exceeded. Please try again in a few seconds.",
          details: "The Judge0 API has rate limits. Please wait before trying again."
        }, { status: 429 });
      }
      
      // Handle server error (500) more specifically
      if (response.status === 500) {
        return NextResponse.json({ 
          error: "Judge0 API server error",
          details: "The Judge0 API is experiencing server errors. Please try again later."
        }, { status: 500 });
      }
      
      // Handle authentication errors
      if (response.status === 401) {
        return NextResponse.json({ 
          error: "Authentication error",
          details: "The API key is missing or invalid. Please check your environment variables."
        }, { status: 401 });
      }
      
      return NextResponse.json({ 
        error: `API request failed with status ${response.status}`,
        details: errorText
      }, { status: response.status });
    }
    
    let data;
    try {
      data = await response.json();
      
    } catch (parseError) {
   
      return NextResponse.json({ 
        error: "Failed to parse Judge0 API response",
        details: parseError instanceof Error ? parseError.message : String(parseError)
      }, { status: 500 });
    }
    
    // Check if we got a token instead of the full result
    if (data.token && (!data.stdout && !data.stderr && !data.compile_output)) {
      
      
      // Poll for results using the token
      let resultData = null;
      let attempts = 0;
      const maxAttempts = 10;
      
      while (!resultData && attempts < maxAttempts) {
        attempts++;
        
        
        // Wait a bit before polling to give Judge0 time to process
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          const pollResponse = await fetch(`${JUDGE0_API_URL}/submissions/${data.token}`, {
            method: "GET",
            headers: {
              "X-RapidAPI-Key": JUDGE0_API_KEY || "",
              "X-RapidAPI-Host": JUDGE0_API_HOST
            }
          });
          
          
          
          if (!pollResponse.ok) {
            
            continue;
          }
          
          const pollData = await pollResponse.json();
          
          
          // Check if the execution is still in progress
          if (pollData.status && (pollData.status.id === 1 || pollData.status.id === 2)) {
           
            continue;
          }
          
          resultData = pollData;
          break;
        } catch (error) {
          console.error("Error during polling:", error);
          // Continue trying despite errors
        }
      }
      
      if (!resultData) {
        console.error("Failed to get execution results after polling");
        return NextResponse.json({ 
          error: "Timeout waiting for execution results" 
        }, { status: 408 });
      }
      
      
      data.stdout = resultData.stdout;
      data.stderr = resultData.stderr;
      data.compile_output = resultData.compile_output;
      data.time = resultData.time;
      data.memory = resultData.memory;
      data.exit_code = resultData.exit_code;
      data.status = resultData.status;
    }
    
    // Handle missing stdout
    if (data.stdout === undefined || data.stdout === null) {
      
      
      
      
      // Set an empty string for stdout if it's undefined
      data.stdout = data.stdout || "";
    }
    
   
    
    return NextResponse.json({ 
      success: true, 
      data: {
        ...data,
        // Ensure these fields exist even if they're null/undefined
        stdout: data.stdout || "",
        stderr: data.stderr || "",
        compile_output: data.compile_output || "",
        time: data.time,
        memory: data.memory,
        exit_code: data.exit_code,
        status: data.status
      } 
    });
  } catch (error) {
    console.error("Server-side Judge0 API error:", error);
    return NextResponse.json({ 
      error: "Error executing code",
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
} 