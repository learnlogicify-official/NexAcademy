import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Medal, Trophy, Award } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const GET_LEADERBOARD = gql`
  query GetLeaderboard($limit: Int, $offset: Int) {
    leaderboard(limit: $limit, offset: $offset) {
      userId
      username
      profilePic
      totalSolved
      totalPoints
      rank
      lastUpdated
    }
  }
`;

interface LeaderboardEntry {
  userId: string;
  username: string;
  profilePic?: string;
  totalSolved: number;
  totalPoints: number;
  rank: number;
  lastUpdated: string;
}

export function Leaderboard() {
  const { data, loading, error } = useQuery(GET_LEADERBOARD, {
    variables: { limit: 10, offset: 0 },
    pollInterval: 300000 // Refresh every 5 minutes
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        Error loading leaderboard
      </div>
    );
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-700" />;
      default:
        return <span className="text-sm font-medium text-slate-600">{rank}</span>;
    }
  };

  return (
    <Card className="p-6 bg-white dark:bg-slate-900/80 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
          Leaderboard
        </h2>
        <span className="text-xs text-slate-500">
          Updated {new Date(data.leaderboard[0]?.lastUpdated).toLocaleDateString()}
        </span>
      </div>

      <div className="space-y-4">
        {data.leaderboard.map((entry: LeaderboardEntry, index: number) => (
          <motion.div
            key={entry.userId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`flex items-center p-3 rounded-lg transition-colors ${
              index < 3
                ? "bg-blue-50/50 dark:bg-blue-900/20"
                : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
            }`}
          >
            <div className="w-8 flex justify-center">{getRankIcon(entry.rank)}</div>
            
            <Link href={`/profile/${entry.username}`} className="flex items-center flex-1 min-w-0">
              <Avatar className="h-8 w-8">
                <img
                  src={entry.profilePic || "/default-avatar.png"}
                  alt={entry.username}
                  className="h-full w-full object-cover rounded-full"
                />
              </Avatar>
              <div className="ml-3 truncate">
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {entry.username}
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {entry.totalSolved}
                </div>
                <div className="text-xs text-slate-500">solved</div>
              </div>
              <div className="text-right min-w-[80px]">
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {entry.totalPoints}
                </div>
                <div className="text-xs text-slate-500">points</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
} 