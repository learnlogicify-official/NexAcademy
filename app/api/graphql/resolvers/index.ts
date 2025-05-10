import { questionResolvers } from './questionResolvers';
import { codeExecutionResolvers } from './codeExecutionResolvers';
import { merge } from 'lodash';
import { GraphQLError } from 'graphql';
import { prisma } from '@/lib/prisma';

// Add userSubmissions query that returns the user's submissions for a specific problem
export const userSubmissionsQuery = {
  userSubmissions: async (
    _: any, 
    { problemId, page = 1, limit = 5 }: { problemId: string; page?: number; limit?: number }, 
    context: any
  ) => {
    if (!context.session?.user?.id) {
      throw new GraphQLError('You must be logged in to view your submissions');
    }
    
    try {
      // Calculate the number of items to skip based on the page number
      const skip = (page - 1) * limit;
      
      // Get the total count for pagination info
      const totalCount = await prisma.problemSubmission.count({
        where: {
          userId: context.session.user.id,
          problemId: problemId
        }
      });
      
      // Get the paginated submissions
      const submissions = await prisma.problemSubmission.findMany({
        where: {
          userId: context.session.user.id,
          problemId: problemId
        },
        orderBy: {
          submittedAt: 'desc'
        },
        skip,
        take: limit
      });
      
      return {
        submissions,
        pagination: {
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
          hasNextPage: skip + submissions.length < totalCount,
          hasPreviousPage: page > 1
        }
      };
    } catch (error) {
      console.error('Error fetching user submissions:', error);
      throw new GraphQLError('Failed to fetch submissions');
    }
  }
};

// Merge all resolvers
export const resolvers = merge(
  questionResolvers,
  codeExecutionResolvers,
  { Query: { ...userSubmissionsQuery } }
); 