import { GraphQLError } from 'graphql';
import { prisma } from '@/lib/prisma';

export const codeDraftResolvers = {
  Mutation: {
    async saveCodeDraft(_: any, { input }: any, context: any) {
      const { userId, problemId, language, code } = input;
      if (!userId || !problemId || !language || !code) {
        throw new GraphQLError('Missing required fields');
      }
      
      try {
        const draft = await prisma.userCodeDraft.upsert({
          where: {
            userId_problemId_language: {
              userId,
              problemId,
              language,
            },
          },
          update: {
            code,
            updatedAt: new Date(),
          },
          create: {
            userId,
            problemId,
            language,
            code,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        
        return { 
          success: true, 
          message: 'Code draft saved successfully', 
          draft 
        };
      } catch (error) {
        console.error('Error saving code draft:', error);
        return {
          success: false,
          message: 'Failed to save code draft',
          draft: null
        };
      }
    },
    
    async saveUserProblemSettings(_: any, { input }: any, context: any) {
      const { userId, problemId, lastLanguage } = input;
      if (!userId || !problemId || !lastLanguage) {
        throw new GraphQLError('Missing required fields');
      }
      try {
        await prisma.userProblemSettings.upsert({
          where: {
            userId_problemId: {
              userId,
              problemId,
            },
          },
          update: {
            lastLanguage,
          },
          create: {
            userId,
            problemId,
            lastLanguage,
          },
        });
        return { success: true, message: 'User problem settings saved.' };
      } catch (err) {
        return { success: false, message: 'Failed to save user problem settings.' };
      }
    },
  },
};
