/**
 * Utility functions for handling Judge0 status codes and verdicts
 */

// Add this flag at the top of the file after the imports
const DEBUG_TIME_LIMIT_EXCEEDED = true;

// Define the supported Judge0 status codes
export enum Judge0StatusCode {
  IN_QUEUE = 1,
  PROCESSING = 2,
  ACCEPTED = 3,
  WRONG_ANSWER = 4,
  TIME_LIMIT_EXCEEDED = 5,
  COMPILATION_ERROR = 6,
  RUNTIME_ERROR_SIGSEGV = 7,
  RUNTIME_ERROR_SIGXFSZ = 8,
  RUNTIME_ERROR_SIGFPE = 9,
  RUNTIME_ERROR_SIGABRT = 10,
  RUNTIME_ERROR_NZEC = 11,
  RUNTIME_ERROR_OTHER = 12,
  INTERNAL_ERROR = 13,
  EXEC_FORMAT_ERROR = 14
}

// Map Judge0 status codes to human-readable verdicts
export const getVerdict = (statusId: number): string => {
  if (DEBUG_TIME_LIMIT_EXCEEDED && statusId === Judge0StatusCode.TIME_LIMIT_EXCEEDED) {
    console.log('DEBUG: Detected Time Limit Exceeded status with ID 5');
  }
  
  switch (statusId) {
    case Judge0StatusCode.ACCEPTED:
      return "Accepted";
    case Judge0StatusCode.WRONG_ANSWER:
      return "Wrong Answer";
    case Judge0StatusCode.TIME_LIMIT_EXCEEDED:
      if (DEBUG_TIME_LIMIT_EXCEEDED) {
        console.log('DEBUG: Returning "Time Limit Exceeded" verdict');
      }
      return "Time Limit Exceeded";
    case Judge0StatusCode.COMPILATION_ERROR:
      return "Compilation Error";
    case Judge0StatusCode.RUNTIME_ERROR_SIGSEGV:
      return "Runtime Error (SIGSEGV)";
    case Judge0StatusCode.RUNTIME_ERROR_SIGXFSZ:
      return "Runtime Error (SIGXFSZ)";
    case Judge0StatusCode.RUNTIME_ERROR_SIGFPE:
      return "Runtime Error (SIGFPE)";
    case Judge0StatusCode.RUNTIME_ERROR_SIGABRT:
      return "Runtime Error (SIGABRT)";
    case Judge0StatusCode.RUNTIME_ERROR_NZEC:
      return "Runtime Error (NZEC)";
    case Judge0StatusCode.RUNTIME_ERROR_OTHER:
      return "Runtime Error";
    case Judge0StatusCode.INTERNAL_ERROR:
      return "Internal Error";
    case Judge0StatusCode.EXEC_FORMAT_ERROR:
      return "Execution Format Error";
    case Judge0StatusCode.IN_QUEUE:
      return "In Queue";
    case Judge0StatusCode.PROCESSING:
      return "Processing";
    default:
      return "Unknown";
  }
};

// Get UI styling based on the verdict
export const getVerdictStyle = (verdict?: string) => {
  if (!verdict) return { 
    header: "bg-gray-50 text-gray-400 border-gray-200",
    output: "bg-gray-50 text-gray-400 border-gray-200",
    icon: null
  };
  
  if (verdict === "Time Limit Exceeded") {
    const style = { 
      header: "bg-purple-200 text-purple-800 border-purple-300",
      output: "bg-purple-200 text-purple-800 border-purple-300",
      icon: "Clock"
    };
    console.log("UI Debug: TLE getVerdictStyle returning:", style);
    return style;
  }
  
  switch (verdict) {
    case "Accepted":
      return { 
        header: "bg-green-50 text-green-800 border-green-200",
        output: "bg-green-50 text-green-800 border-green-100",
        icon: "CheckCircle2"
      };
    case "Wrong Answer":
      return { 
        header: "bg-red-50 text-red-800 border-red-200",
        output: "bg-red-50 text-red-800 border-red-100",
        icon: "XCircle"
      };
    case "Time Limit Exceeded":
      if (DEBUG_TIME_LIMIT_EXCEEDED) {
        console.log("UI Debug: TLE case in switch statement");
      }
      return { 
        header: "bg-purple-200 text-purple-800 border-purple-300",
        output: "bg-purple-200 text-purple-800 border-purple-300",
        icon: "Clock"
      };
    case "Compilation Error":
      return { 
        header: "bg-amber-50 text-amber-800 border-amber-200",
        output: "bg-amber-50 text-amber-800 border-amber-100",
        icon: "AlertTriangle"
      };
    case "Memory Limit Exceeded":
      return { 
        header: "bg-purple-50 text-purple-800 border-purple-200",
        output: "bg-purple-50 text-purple-800 border-purple-100",
        icon: "Cpu"
      };
    case "Runtime Error":
    case "Runtime Error (SIGSEGV)":
    case "Runtime Error (SIGXFSZ)":
    case "Runtime Error (SIGFPE)":
    case "Runtime Error (SIGABRT)":
    case "Runtime Error (NZEC)":
    case "Runtime Error (Other)":
      return { 
        header: "bg-orange-50 text-orange-800 border-orange-200",
        output: "bg-orange-50 text-orange-800 border-orange-100",
        icon: "AlertTriangle"
      };
    case "In Queue":
    case "Processing":
      return { 
        header: "bg-blue-50 text-blue-600 border-blue-200",
        output: "bg-blue-50 text-blue-600 border-blue-100",
        icon: "Loader2"
      };
    default:
      return { 
        header: "bg-gray-50 text-gray-700 border-gray-200",
        output: "bg-gray-50 text-gray-700 border-gray-200",
        icon: "AlertCircle"
      };
  }
};

// Helper function to get a description message based on the verdict
export const getVerdictDescription = (verdict?: string): string => {
  if (!verdict) return "";
  
  switch (verdict) {
    case "Accepted":
      return "Your code produced the correct output for this test case.";
    case "Wrong Answer":
      return "Your code's output doesn't match the expected output for this test case.";
    case "Time Limit Exceeded":
      return "Your code took too long to execute. Try optimizing your algorithm.";
    case "Compilation Error":
      return "Your code couldn't be compiled. Check for syntax errors.";
    case "Memory Limit Exceeded":
      return "Your code exceeded the memory limit. Try reducing memory usage.";
    case "Runtime Error":
    case "Runtime Error (SIGSEGV)":
    case "Runtime Error (SIGXFSZ)":
    case "Runtime Error (SIGFPE)":
    case "Runtime Error (SIGABRT)":
    case "Runtime Error (NZEC)":
    case "Runtime Error (Other)":
      return "Your code crashed during execution. Check for errors like null pointers, division by zero, etc.";
    case "In Queue":
      return "Your code is queued for execution.";
    case "Processing":
      return "Your code is currently being processed.";
    default:
      return "An unknown error occurred while executing your code.";
  }
};

// Helper function to determine if a submission is successful
export const isSuccessfulVerdict = (verdict?: string): boolean => {
  if (!verdict) return false;
  return verdict === "Accepted";
};

// Helper function to determine if a submission is still processing
export const isProcessingVerdict = (verdict?: string): boolean => {
  if (!verdict) return false;
  return verdict === "In Queue" || verdict === "Processing";
}; 