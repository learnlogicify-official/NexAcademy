import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { typeDefs } from './schemas';
import { resolvers } from './resolvers';
import { NextApiResponse } from 'next';
import { Server } from 'http';
import { gql } from '@apollo/client';

// Add base subscription type to ensure it exists
const baseSubscriptionTypeDefs = gql`
  type Subscription {
    _empty: String
  }
`;

// Create an executable schema from our type definitions and resolvers
const schema = makeExecutableSchema({
  typeDefs: [baseSubscriptionTypeDefs, ...typeDefs],
  resolvers,
});

// Function to create and configure WebSocket server
export function createSubscriptionServer(server: Server, res: NextApiResponse) {
  // Create WebSocket server using the HTTP server
  const wsServer = new WebSocketServer({
    server,
    path: '/api/graphql',
  });

  // Import dynamically to avoid TypeScript issues
  const graphqlWs = require('graphql-ws');
  
  // Configure GraphQL WebSocket server
  const serverCleanup = graphqlWs.useServer({
    schema,
    // Context for WebSocket connections (similar to HTTP context)
    context: (ctx: any) => {
      // You can add authentication and session information here
      return {
        // Access connection and session info from ctx.connectionParams
        // Can add user authentication here
      };
    },
    // Handle connection initialization if needed
    onConnect: async (ctx: any) => {
      console.log('Client connected to GraphQL over WebSocket');
      return true;
    },
    // Handle disconnection if needed
    onDisconnect: async (ctx: any) => {
      console.log('Client disconnected from GraphQL over WebSocket');
    },
  }, wsServer);

  // Cleanup function to shut down the WebSocket server
  res.on('close', () => {
    serverCleanup.dispose();
  });
} 