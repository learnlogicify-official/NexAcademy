// NexPractice Theme Configuration
// This file defines common color and styling values to maintain a consistent blue theme

export const NexPracticeTheme = {
  // Primary colors - blue theme
  colors: {
    primary: {
      gradient: "from-blue-600 to-blue-500",
      hover: "from-blue-700 to-blue-600",
      bg: "bg-blue-500",
      bgHover: "hover:bg-blue-600",
      text: "text-blue-600",
      textDark: "dark:text-blue-400",
      border: "border-blue-200",
      borderDark: "dark:border-blue-800/50",
      light: "bg-blue-50",
      lightDark: "dark:bg-blue-900/30",
    },
    secondary: {
      gradient: "from-blue-500 to-blue-600",
      hover: "from-blue-600 to-blue-700",
      bg: "bg-blue-100",
      bgHover: "hover:bg-blue-200",
      text: "text-blue-700",
      textDark: "dark:text-blue-300",
      border: "border-blue-200",
      borderDark: "dark:border-blue-800/50",
    },
    accent: {
      gradient: "from-blue-400 to-blue-500",
      hover: "from-blue-500 to-blue-600",
      bg: "bg-blue-50",
      bgHover: "hover:bg-blue-100",
      text: "text-blue-600",
      textDark: "dark:text-blue-400",
      border: "border-blue-100",
      borderDark: "dark:border-blue-900/50",
    }
  },
  
  // Card and panel stylings
  cards: {
    // Regular card with white/blue accents
    default: {
      bg: "bg-white dark:bg-slate-900",
      header: "bg-gradient-to-r from-blue-50/80 to-blue-100/80 dark:from-blue-950/40 dark:to-blue-900/40",
      border: "border border-blue-100/50 dark:border-blue-900/30",
      shadow: "shadow-md",
    },
    // Accent card with more distinctive blue styling
    accent: {
      bg: "bg-gradient-to-br from-blue-50/90 to-blue-100/80 dark:from-blue-900/30 dark:to-blue-800/30",
      border: "border border-blue-200 dark:border-blue-800/50",
      shadow: "shadow-sm",
    },
    // Hero section card with stronger blue presence
    hero: {
      bg: "bg-gradient-to-br from-blue-50/90 via-blue-50/80 to-blue-50/70 dark:from-blue-950/90 dark:via-blue-950/80 dark:to-blue-950/70",
    }
  },
  
  // Button variants
  buttons: {
    primary: "bg-gradient-to-br from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white",
    secondary: "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-800/80",
    outline: "border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  },
  
  // Badge variants
  badges: {
    default: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
    secondary: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
    outline: "border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300",
    success: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
    danger: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
  },
  
  // Typography
  typography: {
    heading: {
      gradient: "bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 dark:from-blue-300 dark:via-blue-400 dark:to-blue-300 bg-clip-text text-transparent",
      regular: "text-slate-800 dark:text-slate-200",
      accent: "text-blue-700 dark:text-blue-300",
    },
    body: {
      regular: "text-slate-700 dark:text-slate-300",
      muted: "text-slate-600 dark:text-slate-400",
      accent: "text-blue-600 dark:text-blue-400",
    }
  },
  
  // Status indicators
  status: {
    success: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
    error: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
    neutral: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
  },
  
  // Difficulty levels with blue-based styling
  difficulty: {
    easy: {
      bg: "bg-gradient-to-r from-blue-300 to-green-400 text-white",
      badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
    },
    medium: {
      bg: "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
      badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
    },
    hard: {
      bg: "bg-gradient-to-r from-blue-700 to-blue-800 text-white",
      badge: "bg-blue-200 text-blue-900 dark:bg-blue-800/50 dark:text-blue-200",
    }
  },
  
  // Input fields
  inputs: {
    default: "border-blue-200 dark:border-blue-800/50 focus:border-blue-500 focus:ring-blue-500",
    search: "pl-9 border-blue-200 dark:border-blue-800/50 bg-white/80 dark:bg-slate-900/50 focus-visible:ring-blue-500",
  }
};

// Export specific theme configurations for direct import
export const {
  colors,
  cards,
  buttons,
  badges,
  typography,
  status,
  difficulty,
  inputs
} = NexPracticeTheme; 