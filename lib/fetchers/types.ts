export interface ContestEntry {
  name: string;
  date: string;
  rank: number;
  /** @deprecated Use newRating instead */
  rating?: number;
  oldRating?: number;
  newRating?: number;
  problemsSolved?: number;
  totalProblems?: number;
  ratingChange?: number;
  code?: string;
  url?: string;
}

export interface ActivityPoint {
  date: string;
  count: number;
}

export interface ProfileStats {
  streak?: number;
  totalActiveDays?: number;
  [key: string]: any;
}

export interface PlatformProfile {
  platform: string;
  username: string;
  totalSolved?: number;
  fullySolved?: number;
  partiallySolved?: number;
  rank?: number | string;
  rating?: number;
  contests?: number;
  badges?: number;
  badgeNames?: string[];
  score?: number;
  problemsByDifficulty?: Record<string, number>;
  recentActivity?: any[];
  error?: string;
  contestHistory?: ContestEntry[];
  activityHeatmap?: ActivityPoint[];
  recentHeatmap?: ActivityPoint[];
  profileImage?: string;
  highestRating?: number;
  country?: string;
  countryFlag?: string;
  globalRank?: number;
  countryRank?: number;
  starsString?: string;
  apiHeatMap?: any;
  apiRatingData?: any;
  stats?: ProfileStats;
} 