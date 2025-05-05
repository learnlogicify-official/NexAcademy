import fetch from 'node-fetch';

// Default Judge0 API URL as fallback
const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'http://128.199.24.150:2358';

let languageCache: { [id: number]: string } | null = null;
let lastFetch = 0;

export async function getJudge0LanguageName(id: number): Promise<string | null> {
  // Cache for 10 minutes
  if (!languageCache || Date.now() - lastFetch > 10 * 60 * 1000) {
    try {
      const res = await fetch(`${JUDGE0_API_URL}/languages`);
      if (!res.ok) throw new Error('Failed to fetch Judge0 languages');
      const langs = await res.json();
      languageCache = {};
      langs.forEach((lang: { id: number, name: string }) => {
        languageCache![lang.id] = lang.name;
      });
      lastFetch = Date.now();
    } catch (e) {
      // Check if we have hardcoded language mappings as fallback
      const JUDGE0_LANGUAGE_MAP: Record<number, string> = {
        53: "C++ (GCC 8.3.0)",
        54: "C++ (GCC 9.2.0)",
        63: "JavaScript (Node.js 12.14.0)",
        70: "Python (2.7.17)",
        71: "Python (3.8.1)",
        62: "Java (OpenJDK 13.0.1)",
      };
      
      // Return from our hardcoded map if available
      if (JUDGE0_LANGUAGE_MAP[id]) {
        return JUDGE0_LANGUAGE_MAP[id];
      }
      
      // Still log the error for debugging
      console.error('[JUDGE0] Error fetching languages:', e);
      return null;
    }
  }
  return languageCache[id] || null;
} 