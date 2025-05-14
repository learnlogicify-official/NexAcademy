/**
 * Utility functions for generating SVG paths for charts in the coding portfolio dashboard
 */

/**
 * Generates a random SVG path for mini-charts when real data is not available
 * @param points Number of points in the path
 * @returns SVG path string
 */
export function generateRandomPath(points: number): string {
  let path = `M 0 10`;
  const increment = 100 / (points - 1);
  
  for (let i = 1; i < points; i++) {
    const x = i * increment;
    const y = 10 - Math.random() * 10; // Random value between 0-10
    path += ` L ${x} ${y}`;
  }
  
  return path;
}

/**
 * Generates an SVG path from actual rating history
 * @param ratings Array of rating values
 * @param height Height of the SVG viewport
 * @returns SVG path string
 */
export function generateRatingsPath(ratings: number[], height: number): string {
  if (ratings.length < 2) return generateRandomPath(10);
  
  // Find min and max for scaling
  const minRating = Math.min(...ratings);
  const maxRating = Math.max(...ratings);
  const range = maxRating - minRating > 0 ? maxRating - minRating : 100;
  
  // Start path
  let path = `M 0 ${height - ((ratings[0] - minRating) / range * height)}`;
  
  // Add points for each rating
  const increment = 100 / (ratings.length - 1);
  
  for (let i = 1; i < ratings.length; i++) {
    const x = i * increment;
    // Invert Y since SVG coordinates start from top
    const y = height - ((ratings[i] - minRating) / range * height);
    path += ` L ${x} ${y}`;
  }
  
  return path;
}

/**
 * Adjusts a hex color brightness
 * @param hex Hex color code
 * @param percent Brightness adjustment percentage (negative darkens, positive lightens)
 * @returns RGBA color string with 0.1 alpha
 */
export function adjustColor(hex: string, percent: number): string {
  // Remove the # if it exists
  hex = hex.replace('#', '');
  
  // Convert to RGB
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  
  // Adjust brightness
  r = Math.min(255, Math.floor(r * (100 + percent) / 100));
  g = Math.min(255, Math.floor(g * (100 + percent) / 100));
  b = Math.min(255, Math.floor(b * (100 + percent) / 100));
  
  // Convert back to hex with alpha
  return `rgba(${r}, ${g}, ${b}, 0.1)`;
}

/**
 * Calculates the change percentage between old and new value
 * @param oldValue Previous value
 * @param newValue Current value
 * @returns Percentage change as a number
 */
export function calculateChangePercentage(oldValue: number, newValue: number): number {
  if (oldValue === 0) return 0;
  return +((newValue - oldValue) / oldValue * 100).toFixed(1);
}

/**
 * Determines the trend direction based on percentage change
 * @param percentage Change percentage 
 * @returns 'up', 'down', or 'neutral' as a string
 */
export function getTrendDirection(percentage: number): 'up' | 'down' | 'neutral' {
  if (percentage > 0) return 'up';
  if (percentage < 0) return 'down';
  return 'neutral';
} 