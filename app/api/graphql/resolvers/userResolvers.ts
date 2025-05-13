import { GraphQLError } from 'graphql';
import { getUserXP, getXPLeaderboard } from '@/lib/xp-service';

// Type for context passed from Apollo Server
interface Context {
  session?: any;
  req: Request;
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
    }
  }
}; 