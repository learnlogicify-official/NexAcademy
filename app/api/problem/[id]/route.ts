import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Map of Judge0 language IDs to their display names
// This can be expanded with more languages as needed
const JUDGE0_LANGUAGE_MAP: Record<number, string> = {
  1: "C (GCC 7.4.0)",
  2: "C++ (GCC 7.4.0)",
  3: "C++ (GCC 8.3.0)",
  4: "C++ (GCC 9.2.0)",
  5: "C# (Mono 6.6.0.161)",
  6: "C# (.NET Core 3.1.0)",
  7: "C# (Mono 4.6.2.0)",
  8: "JavaScript (Node.js 12.14.0)",
  9: "JavaScript (Node.js 10.16.3)",
  10: "Java (OpenJDK 13.0.1)",
  11: "Java (OpenJDK 11.0.4)",
  12: "Java (OpenJDK 8)",
  13: "Python (3.8.1)",
  14: "Python (2.7.17)",
  15: "Ruby (2.7.0)",
  16: "Go (1.13.5)",
  17: "Bash (5.0.0)",
  18: "SQL (SQLite 3.27.2)",
  19: "Swift (5.2.3)",
  20: "Rust (1.40.0)",
  21: "PHP (7.4.1)",
  22: "TypeScript (3.7.4)",
  23: "C++ (MSVC 2017)",
  24: "C++ (Clang 7.0.1)",
  25: "Kotlin (1.3.70)",
  26: "F#",
  27: "Dart (2.7.1)",
  28: "Perl (5.28.1)",
  29: "Erlang (OTP 22.2)",
  30: "Elixir (1.9.4)",
  31: "Scala (2.13.2)",
  32: "Haskell (GHC 8.8.3)",
  33: "Lua (5.3.5)",
  34: "R (4.0.0)",
  35: "Ruby (2.7.1)",
  36: "Crystal (0.33.0)",
  37: "D (DMD 2.091.0)",
  38: "Prolog (GNU Prolog 1.4.5)",
  39: "Scheme (Gauche 0.9.9)",
  40: "Forth (gforth 0.7.3)",
  41: "Lisp (SBCL 2.0.0)",
  42: "Clojure (1.10.1)",
  43: "OCaml (4.10.0)",
  44: "Python 3"
};

// Get a simplified display name for the language
function getSimplifiedLanguageName(id: number): string {
  const fullName = JUDGE0_LANGUAGE_MAP[id] || `Language ${id}`;
  
  // For languages with multiple versions, we want to include the version number
  if (fullName.includes("JavaScript (Node.js")) {
    const match = fullName.match(/JavaScript \(Node.js ([\d\.]+)\)/);
    return match ? `JavaScript ${match[1]}` : "JavaScript";
  }
  
  if (fullName.includes("Java (OpenJDK")) {
    const match = fullName.match(/Java \(OpenJDK ([\d\.]+)\)/);
    return match ? `Java ${match[1]}` : "Java";
  }
  
  if (fullName.includes("Python (3")) {
    const match = fullName.match(/Python \(([\d\.]+)\)/);
    return match ? `Python ${match[1]}` : "Python";
  }
  
  if (fullName.includes("Python (2")) {
    const match = fullName.match(/Python \(([\d\.]+)\)/);
    return match ? `Python ${match[1]}` : "Python 2";
  }
  
  if (fullName.includes("C++ (GCC")) {
    const match = fullName.match(/C\+\+ \(GCC ([\d\.]+)\)/);
    return match ? `C++ ${match[1]}` : "C++";
  }
  
  if (fullName.includes("C++ (MSVC")) {
    return "C++ MSVC";
  }
  
  if (fullName.includes("C++ (Clang")) {
    const match = fullName.match(/C\+\+ \(Clang ([\d\.]+)\)/);
    return match ? `C++ Clang ${match[1]}` : "C++ Clang";
  }
  
  if (fullName.includes("C# (Mono")) {
    const match = fullName.match(/C# \(Mono ([\d\.]+)\)/);
    return match ? `C# Mono ${match[1]}` : "C#";
  }
  
  if (fullName.includes("C# (.NET")) {
    const match = fullName.match(/C# \(\.NET ([\d\.]+)\)/);
    return match ? `C# .NET ${match[1]}` : "C# .NET";
  }
  
  // Basic extractions for other languages
  if (fullName.startsWith("C ")) return "C";
  if (fullName.startsWith("TypeScript")) return "TypeScript";
  if (fullName.startsWith("Ruby")) return "Ruby";
  if (fullName.startsWith("Go")) return "Go";
  if (fullName.startsWith("PHP")) return "PHP";
  if (fullName.startsWith("Swift")) return "Swift";
  if (fullName.startsWith("Rust")) return "Rust";
  if (fullName.startsWith("Kotlin")) return "Kotlin";
  if (fullName.startsWith("Dart")) return "Dart";
  
  // Otherwise return the full name
  return fullName;
}

export async function GET(request: Request, context: Promise<{ params: { id: string } }>) {
  try {
    const { params } = await context;
    /* @next-codemod-ignore */
    const id = params.id;
    
    // Fetch coding question from database
    const question = await prisma.question.findUnique({
      where: {
        id: id,
      },
      include: {
        codingQuestion: {
          include: {
            tags: true,
            testCases: true,
            languageOptions: true
          }
        }
      },
    });

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // Prepare default empty arrays for optional fields
    const tags = question.codingQuestion?.tags?.map(tag => tag.name) || [];
    
    // These properties might not exist in the database schema yet, so handle them safely
    // @ts-ignore - Property might not exist in schema yet
    const constraints = question.codingQuestion?.constraints || [];
    
    // Ensure we have properly formed test cases
    const sampleTestCases = question.codingQuestion?.testCases
      .filter(test => test.isSample)
      .map(test => ({
        id: test.id,
        input: test.input?.trim() || 'No input provided',
        expectedOutput: test.output?.trim() || 'No output provided',
        status: 'pending'
      })) || [];
      
    const hiddenTestCases = question.codingQuestion?.testCases
      .filter(test => test.isHidden)
      .map(test => ({
        id: test.id,
        input: test.input?.trim() || 'No input provided',
        expectedOutput: test.output?.trim() || 'No output provided',
        status: 'pending'
      })) || [];

    // Format response similar to the sample problem data structure
    const formattedProblem = {
      id: question.id,
      // @ts-ignore - Property might not exist in schema yet
      number: question.codingQuestion?.orderNumber || 1, 
      title: question.name || 'Untitled Problem',
      difficulty: question.codingQuestion?.difficulty || 'MEDIUM',
      tags: tags,
      // @ts-ignore - Property might not exist in schema yet
      level: question.codingQuestion?.level || 1, 
      description: question.codingQuestion?.questionText || '',
      // @ts-ignore - Property might not exist in schema yet
      inputFormat: question.codingQuestion?.inputFormat || '', 
      // @ts-ignore - Property might not exist in schema yet
      outputFormat: question.codingQuestion?.outputFormat || '', 
      // Removing constraints from the response
      // constraints: constraints,
      sampleTestCases: sampleTestCases,
      hiddenTestCases: hiddenTestCases,
      starterCode: question.codingQuestion?.languageOptions[0]?.preloadCode || '// Write your code here',
      solution: question.codingQuestion?.languageOptions[0]?.solution || '',
      // @ts-ignore - Property might not exist in schema yet
      explanation: question.codingQuestion?.explanation || '', 
      // @ts-ignore - Property might not exist in schema yet
      xpReward: question.codingQuestion?.xpReward || 10,
      // Add languageOptions to the response, mapping language IDs to language names
      languageOptions: question.codingQuestion?.languageOptions.map(option => {
        const languageId = parseInt(option.language || '0', 10); // Parse language to number (it's stored as ID in DB)
        return {
          id: option.id,
          languageId: languageId, // Keep original language ID
          name: getSimplifiedLanguageName(languageId), // Get display name from map
          preloadCode: option.preloadCode || '// Write your code here',
          solution: option.solution || ''
        };
      }) || [{ id: 1, languageId: 8, name: 'JavaScript', preloadCode: '// Write your code here', solution: '' }]
    };

    return NextResponse.json(formattedProblem);
  } catch (error) {
    console.error('Error fetching problem:', error);
    return NextResponse.json(
      { error: 'Failed to fetch problem' },
      { status: 500 }
    );
  }
}

// --- USER CODE DRAFT ENDPOINTS ---
// (Moved to /api/problem/[id]/save-code/route.ts and /api/problem/[id]/load-code/route.ts) 