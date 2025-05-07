import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { typeDefs } from './schemas';
import { resolvers } from './resolvers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextRequest } from 'next/server';

// Create Apollo Server instance
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Create handler with context for authentication
const handler = startServerAndCreateNextHandler(server, {
  context: async (req: NextRequest) => {
    // Get the session from NextAuth
    const session = await getServerSession(authOptions);
    
    // Return the context with session information
    return {
      session,
      req,
    };
  },
});

// Define the GET and POST handlers for the route
export { handler as GET, handler as POST }; 