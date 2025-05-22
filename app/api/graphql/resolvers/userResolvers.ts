import { GraphQLError } from 'graphql';
import { getUserXP, getXPLeaderboard } from '@/lib/xp-service';
import { prisma } from '@/lib/prisma';

// Type for context passed from Apollo Server
interface Context {
  session?: any;
  req: Request;
}

// PlatformHandle interface
interface PlatformHandle {
  id: string;
  platform: string;
  handle: string;
}

// Helper function to validate authentication
function validateAuth(context: Context) {
  if (!context.session?.user) {
    throw new GraphQLError('Unauthorized', {
      extensions: { code: 'UNAUTHORIZED' }
    });
  }
  return context.session.user;
}

export const userResolvers = {
  Query: {
    // ... existing queries ...
    
    // Get current user's XP information
    myXP: async (_: any, __: any, context: Context) => {
      try {
        // Validate user authentication
        const user = validateAuth(context);
        
        // Get user's XP information
        const xpInfo = await getUserXP(user.id);
        
        return {
          xp: xpInfo?.xp || 0,
          level: xpInfo?.level || 1,
          events: xpInfo?.events || []
        };
      } catch (error) {
        console.error('Error fetching user XP:', error);
        throw new GraphQLError('Failed to fetch XP information', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }
    },
    
    // Get XP leaderboard
    xpLeaderboard: async (_: any, { limit = 10 }: { limit?: number }, context: Context) => {
      try {
        // Validate user authentication
        validateAuth(context);
        
        // Get leaderboard data
        const leaderboard = await getXPLeaderboard(limit);
        
        // Format the response to match the GraphQL schema
        return (leaderboard as any[]).map((entry) => ({
          user: {
            id: entry.id,
            name: entry.name,
            image: entry.image
          },
          xp: entry.xp,
          level: entry.level
        }));
      } catch (error) {
        console.error('Error fetching XP leaderboard:', error);
        throw new GraphQLError('Failed to fetch leaderboard', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }
    },

    // Get user stats (xp, streak, platformHandles)
    userStats: async (_: any, __: any, context: Context) => {
      try {
        // Check authentication
        if (!context.session || !context.session.user) {
          return {
            xp: 0,
            streak: 0,
            platformHandles: []
          };
        }

        const user = context.session.user;
        
        // Use Promise.all to fetch XP and streak in parallel
        const [xpInfo, userStreak] = await Promise.all([
          // Get user's XP
          getUserXP(user.id).catch(() => ({ xp: 0 })),
          
          // Get user's streak
          prisma.userStreak.findUnique({
            where: { userId: user.id }
          }).catch(() => ({ currentStreak: 0 }))
        ]);
        
        // Get platform handles (will only be requested by specific pages)
        const platformHandles = await prisma.userPlatformHandle.findMany({
          where: { userId: user.id },
          select: {
            id: true,
            platform: true,
            handle: true
          }
        }).catch(() => []);
        
        return {
          xp: xpInfo?.xp || 0,
          streak: userStreak?.currentStreak || 0,
          platformHandles
        };
      } catch (error) {
        console.error("Error in userStats resolver:", error);
        // Return default values on error
        return {
          xp: 0,
          streak: 0,
          platformHandles: []
        };
      }
    }
  }
}; 