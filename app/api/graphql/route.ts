import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { typeDefs } from './schemas';
import { resolvers } from './resolvers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextRequest } from 'next/server';
import { createYoga } from 'graphql-yoga';
import { makeExecutableSchema } from '@graphql-tools/schema';

// Add the base subscription type definition
import { gql } from '@apollo/client';

const baseSubscriptionTypeDefs = gql`
  type Subscription {
    _empty: String
  }
`;

// Create a combined schema
const schema = makeExecutableSchema({
  typeDefs: [baseSubscriptionTypeDefs, ...typeDefs],
  resolvers,
});

// Create Apollo Server instance
const server = new ApolloServer({
  schema,
});

// Create a yoga server that supports subscriptions
const yoga = createYoga({
  schema,
  graphqlEndpoint: '/api/graphql',
  landingPage: false,
  logging: {
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error
  }
});

// Create handler with context for authentication
const apolloHandler = startServerAndCreateNextHandler(server, {
  context: async (req: NextRequest) => {
    try {
      // Get the session from NextAuth
      const session = await getServerSession(authOptions);
      
      // Return the context with session information
      return {
        session,
        req,
      };
    } catch (error) {
      // If getting the session fails, continue without it
      console.error('Error getting session:', error);
      return { req };
    }
  },
});

// Combined handler that detects WebSocket upgrades and routes appropriately
export async function GET(req: NextRequest) {
  // Check if it's a WebSocket request
  if (req.headers.get('upgrade')?.toLowerCase() === 'websocket') {
    return yoga.fetch(req);
  }
  
  // Otherwise, use the Apollo handler
  return apolloHandler(req);
}

export async function POST(req: NextRequest) {
  return apolloHandler(req);
} 