// Map of language names to Judge0 language IDs
const LANGUAGE_ID_MAP: Record<string, number> = {
  // C
  "C": 50,          // C (GCC 9.2.0)
  "C (GCC 9.2.0)": 50,
  
  // C++
  "C++": 54,        // C++ (GCC 9.2.0)
  "C++ (GCC 9.2.0)": 54,
  
  // Java
  "Java": 62,       // Java (OpenJDK 13.0.1)
  "Java (OpenJDK 13.0.1)": 62,
  
  // JavaScript
  "JavaScript": 63, // JavaScript (Node.js 12.14.0)
  "JavaScript (Node.js 12.14.0)": 63,
  "Node.js": 63,
  
  // Python
  "Python": 71,     // Python (3.8.1)
  "Python 3": 71,
  "Python (3.8.1)": 71,
  "Python 2": 70,
  "Python (2.7.17)": 70,
  
  // Ruby
  "Ruby": 72,       // Ruby (2.7.0)
  "Ruby (2.7.0)": 72,
  
  // Swift
  "Swift": 83,      // Swift (5.2.3)
  "Swift (5.2.3)": 83,
  
  // Go
  "Go": 60,         // Go (1.13.5)
  "Go (1.13.5)": 60,
  
  // TypeScript
  "TypeScript": 74, // TypeScript (3.7.4)
  "TypeScript (3.7.4)": 74,
  
  // PHP
  "PHP": 68,        // PHP (7.4.1)
  "PHP (7.4.1)": 68,
  
  // Rust
  "Rust": 73,       // Rust (1.40.0)
  "Rust (1.40.0)": 73,
  
  // Kotlin
  "Kotlin": 78,     // Kotlin (1.3.70)
  "Kotlin (1.3.70)": 78,
};

/**
 * Get the Judge0 language ID from a language name
 * @param languageName The name of the programming language
 * @returns The Judge0 language ID or 71 (Python 3) as a default
 */
export function getLanguageId(languageName: string): number {
  
  // Special case: for "Java"
  if (languageName === "Java") {
   
    return 62;
  }
  
  // If languageName is a language ID, return it directly
  if (!isNaN(Number(languageName))) {
    const numId = Number(languageName);
    return numId;
  }
  
  // Try direct lookup first
  if (LANGUAGE_ID_MAP[languageName]) {
    return LANGUAGE_ID_MAP[languageName];
  }
  
  // Try case-insensitive lookup
  const normalizedName = languageName.toLowerCase();
  for (const [key, value] of Object.entries(LANGUAGE_ID_MAP)) {
    if (key.toLowerCase() === normalizedName) {
      return value;
    }
  }
  
  // Try partial match with specific language checks
  if (normalizedName.includes("java")) {
    return 62; // Java
  }
  
  if (normalizedName.includes("python") || normalizedName.includes("py")) {
    if (normalizedName.includes("2")) {
      return 70; // Python 2
    } else {
      return 71; // Python 3
    }
  }
  
  if (normalizedName.includes("c++") || normalizedName.includes("cpp")) {
    return 54; // C++
  }
  
  if (normalizedName === "c" || normalizedName.includes("clang")) {
    return 50; // C
  }
  
  // Try partial match as a last resort
  for (const [key, value] of Object.entries(LANGUAGE_ID_MAP)) {
    if (normalizedName.includes(key.toLowerCase()) || 
        key.toLowerCase().includes(normalizedName)) {
      return value;
    }
  }
  
  // Default to Python 3 if no match found
  return 71;
} 