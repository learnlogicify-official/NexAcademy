import { colors } from './colors';

// Theme configuration object for the entire application
export const theme = {
  borderRadius: {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full"
  },
  spacing: {
    xs: "space-x-1",
    sm: "space-x-2",
    md: "space-x-3",
    lg: "space-x-4",
    xl: "space-x-6"
  },
  animation: {
    spin: "animate-spin",
    pulse: "animate-pulse",
    bounce: "animate-bounce",
    gradient: "animate-gradient-x"
  },
  shadow: {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl"
  },
  transition: {
    default: "transition-all duration-200",
    fast: "transition-all duration-150",
    slow: "transition-all duration-300"
  }
};

export { colors };

// Export everything as default
export default {
  colors,
  theme
};
