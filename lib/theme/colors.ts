export const colors = {
  nexpractice: {
    primary: {
      gradient: "from-indigo-500 to-indigo-600",
      background: "bg-indigo-500",
      hex: "#6366F1", // indigo-500
      light: {
        bg: "bg-indigo-50",
        text: "text-indigo-700",
        border: "border-indigo-200",
        hover: "hover:bg-indigo-100"
      },
      dark: {
        bg: "dark:bg-indigo-900/30",
        text: "dark:text-indigo-300", 
        border: "dark:border-indigo-800/50",
        hover: "dark:hover:bg-indigo-900/40"
      }
    },
    secondary: {
      gradient: "from-purple-500 to-pink-500",
      background: "bg-purple-500",
      light: {
        bg: "bg-purple-50",
        text: "text-purple-700",
        border: "border-purple-200"
      },
      dark: {
        bg: "dark:bg-purple-900/30",
        text: "dark:text-purple-300",
        border: "dark:border-purple-800/50"
      }
    },
    status: {
      success: {
        bg: "bg-green-100",
        text: "text-green-800",
        dark: {
          bg: "dark:bg-green-900/30",
          text: "dark:text-green-300"
        }
      },
      warning: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        dark: {
          bg: "dark:bg-yellow-900/30",
          text: "dark:text-yellow-300"
        }
      },
      error: {
        bg: "bg-red-100",
        text: "text-red-800",
        dark: {
          bg: "dark:bg-red-900/30",
          text: "dark:text-red-300"
        }
      }
    },
    ui: {
      card: {
        gradient: "from-white via-slate-50 to-white dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-900",
        border: "border-indigo-100 dark:border-indigo-900/50"
      },
      button: {
        primary: {
          base: "bg-gradient-to-r from-indigo-600 to-indigo-700",
          hover: "hover:from-indigo-700 hover:to-indigo-800",
          text: "text-white"
        },
        secondary: {
          base: "bg-white dark:bg-slate-800",
          hover: "hover:bg-indigo-50 dark:hover:bg-indigo-900/30",
          text: "text-indigo-700 dark:text-indigo-300",
          border: "border-indigo-200 dark:border-indigo-800/50"
        }
      }
    }
  }
};

// Helper function to combine multiple color classes
export const cx = (...classes: string[]) => classes.filter(Boolean).join(" ");

// Example usage:
// import { colors, cx } from 'lib/theme/colors';
//
// Button example:
// className={cx(
//   colors.nexpractice.ui.button.primary.base,
//   colors.nexpractice.ui.button.primary.hover,
//   colors.nexpractice.ui.button.primary.text
// )}
//
// Card example:
// className={cx(
//   colors.nexpractice.ui.card.gradient,
//   colors.nexpractice.ui.card.border
// )}
