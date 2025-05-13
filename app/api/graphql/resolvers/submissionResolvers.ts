import { GraphQLError } from 'graphql';
import { prisma } from '@/lib/prisma';

// Type for context passed from Apollo Server
interface Context {
  session?: any;
  req: Request;
}

// Helper function to validate auth
const validateAuth = (context: Context, requireAdmin = false) => {
  if (!context.session?.user) {
    throw new GraphQLError('Unauthorized', {
      extensions: { code: 'UNAUTHENTICATED' }
    });
  }

  if (requireAdmin && context.session.user.role !== 'ADMIN') {
    throw new GraphQLError('Forbidden - Admin access required', {
      extensions: { code: 'FORBIDDEN' }
    });
  }

  return context.session.user;
};

export const submissionResolvers = {
  Query: {
    problemSubmissions: async (
      _: any, 
      { problemId, userId, page = 1, pageSize = 5 }: { 
        problemId: string; 
        userId?: string; 
        page?: number; 
        pageSize?: number; 
      }, 
      context: Context
    ) => {
      try {
        // Validate user authentication
        const user = validateAuth(context);
        
        // Validate input
        if (!problemId) {
          throw new GraphQLError('Problem ID is required', {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }

        // Only allow fetching own submissions unless user is admin
        const requestedUserId = userId || user.id;
        if (requestedUserId !== user.id && user.role !== 'ADMIN') {
          throw new GraphQLError('You can only view your own submissions', {
            extensions: { code: 'FORBIDDEN' }
          });
        }
        
      
        
        // Calculate pagination
        const skip = (page - 1) * pageSize;

        // Fetch total count for pagination
        const totalCount = await prisma.problemSubmission.count({
          where: {
            problemId,
            userId: requestedUserId,
          },
        });
        
        

        // Fetch submissions with pagination
        const submissions = await prisma.problemSubmission.findMany({
          where: {
            problemId,
            userId: requestedUserId,
          },
          orderBy: {
            submittedAt: 'desc',
          },
          skip,
          take: pageSize,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });
        

        // Add status field based on allPassed
        const submissionsWithStatus = submissions.map(submission => ({
          ...submission,
          status: submission.allPassed ? 'ACCEPTED' : 'FAILED'
        }));

        // Return submissions with pagination info
        return {
          submissions: submissionsWithStatus,
          total: totalCount,
          page,
          pageSize,
          totalPages: Math.ceil(totalCount / pageSize),
        };
      } catch (error: any) {
        console.error('Error fetching submissions:', error);
        throw new GraphQLError(error.message || 'Failed to fetch submissions', {
          extensions: { code: error.extensions?.code || 'INTERNAL_SERVER_ERROR' }
        });
      }
    }
  }
}; 