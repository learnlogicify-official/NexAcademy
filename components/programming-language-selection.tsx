"use client"
import { useState, useEffect } from "react"
import { Check, ArrowUpRight, Search } from "lucide-react"
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient"
import { motion } from "framer-motion"

interface ProgrammingLanguageSelectionProps {
  username: string
  onSelectLanguage: (language: string) => void
}

interface LanguageOption {
  id: string;
  name: string;
  judge0Id?: number;
}

interface Judge0Language {
  id: number;
  name: string;
}

export default function ProgrammingLanguageSelection({
  username,
  onSelectLanguage,
}: ProgrammingLanguageSelectionProps) {
  const [selectedLanguageId, setSelectedLanguageId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [languageOptions, setLanguageOptions] = useState<LanguageOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Fetch Judge0 languages from JSON file
  useEffect(() => {
    const loadLanguages = async () => {
      try {
        setIsLoading(true);
        // Fetch the languages from the JSON file
        const response = await fetch('/judge0-languages.json');
        if (!response.ok) {
          throw new Error('Failed to load languages');
        }
        
        const judge0Languages = await response.json() as Judge0Language[];
        
        // Transform Judge0 languages to our LanguageOption format
        const transformedLanguages: LanguageOption[] = judge0Languages
          .filter((lang: Judge0Language) => 
            // Skip Plain Text and Executable as they're not programming languages
            lang.id !== 43 && lang.id !== 44 && lang.id !== 89
          )
          .map((lang: Judge0Language) => ({
            id: lang.id.toString(),
            name: lang.name,
            judge0Id: lang.id
          }));
        
        setLanguageOptions(transformedLanguages);
      } catch (error) {
        console.error('Error loading Judge0 languages:', error);
        // Fallback to a minimal set if loading fails
        setLanguageOptions([
          { id: "71", name: "Python (3.8.1)", judge0Id: 71 },
          { id: "63", name: "JavaScript (Node.js 12.14.0)", judge0Id: 63 },
          { id: "54", name: "C++ (GCC 9.2.0)", judge0Id: 54 },
          { id: "62", name: "Java (OpenJDK 13.0.1)", judge0Id: 62 },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLanguages();
  }, []);

  const handleLanguageSelect = (languageId: string) => {
    setSelectedLanguageId(languageId)
  }

  const handleContinue = () => {
    if (selectedLanguageId) {
      const selectedLanguage = languageOptions.find((lang) => lang.id === selectedLanguageId)
      if (selectedLanguage) {
        onSelectLanguage(selectedLanguage.name)
      }
    }
  }

  // Filter languages based on search query
  const filteredLanguages = languageOptions.filter((lang) =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.01,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
  }

  return (
    <div className="w-full flex flex-col items-center space-y-6">
      <h2 className="text-white text-2xl md:text-3xl font-bricolage mb-2 text-center">
        What's your <span className="text-blue-400">language</span> of choice?
      </h2>
      <p className="text-white/70 text-center mb-4">
        Select your preferred programming language, <span className="text-blue-400">{username}</span>
      </p>

      {/* Search input */}
      <div className="relative w-full max-w-md mb-2">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search languages..."
          className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="w-full flex justify-center py-8">
          <div className="animate-pulse flex space-x-4">
            <div className="h-6 w-24 bg-gray-700 rounded"></div>
            <div className="h-6 w-36 bg-gray-700 rounded"></div>
            <div className="h-6 w-28 bg-gray-700 rounded"></div>
          </div>
        </div>
      ) : (
        <motion.div
          className="flex flex-wrap justify-center gap-2 w-full max-w-4xl max-h-[60vh] overflow-y-auto p-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredLanguages.map((language) => (
            <motion.button
              key={language.id}
              variants={itemVariants}
              onClick={() => handleLanguageSelect(language.id)}
              className={`px-4 py-2 rounded-full text-sm transition-all duration-300 
                ${
                  selectedLanguageId === language.id
                    ? `bg-gradient-to-r from-blue-500 to-indigo-600 text-white`
                    : "bg-zinc-900 text-white/80 hover:bg-zinc-800 border border-zinc-700"
                }
                hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
              `}
            >
              {selectedLanguageId === language.id && <Check className="w-3 h-3 inline-block mr-1.5 -mt-0.5" />}
              {language.name}
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Show message if no languages match the search */}
      {filteredLanguages.length === 0 && !isLoading && (
        <div className="text-white/70 text-center py-4">
          No languages found matching "{searchQuery}". Try a different search term.
        </div>
      )}

      <div className="mt-8">
        <HoverBorderGradient
          containerClassName={`rounded-full ${!selectedLanguageId ? "opacity-50 cursor-not-allowed" : ""}`}
          as="button"
          className={`dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2 ${
            !selectedLanguageId ? "pointer-events-none" : ""
          }`}
          disabled={!selectedLanguageId}
          onClick={handleContinue}
        >
          <span>Continue</span>
          <ArrowUpRight className="w-4 h-4 ml-1" />
        </HoverBorderGradient>
      </div>
    </div>
  )
}