import { questionResolvers } from './questionResolvers';

// Combine all resolvers
export const resolvers = {
  Query: {
    ...questionResolvers.Query,
  },
  Mutation: {
    ...questionResolvers.Mutation,
  },
}; 