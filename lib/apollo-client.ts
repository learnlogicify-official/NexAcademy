import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { createClient } from 'graphql-ws';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { isServer } from '@/utils/helpers';

// HTTP link to the GraphQL API endpoint
const httpLink = createHttpLink({
  uri: '/api/graphql',
});

// Auth link to attach the session token to requests
const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      // Add any auth headers if needed in the future
    }
  }
});

// Create a client-side only WebSocket link
const getWsLink = () => {
  if (isServer()) return null;

  return new GraphQLWsLink(
    createClient({
      url: getWebSocketUrl(),
      // Add authentication if needed
    })
  );
};

// Helper to get the WebSocket URL based on the current environment
const getWebSocketUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  return `${protocol}//${host}/api/graphql`;
};

// Split link based on operation type (query/mutation vs subscription)
const getLink = () => {
  const wsLink = getWsLink();
  
  // If we're on the server or WebSockets aren't available, just use HTTP
  if (!wsLink) return authLink.concat(httpLink);
  
  // Split based on operation type
  return split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    authLink.concat(httpLink)
  );
};

// Create the Apollo Client instance
export const apolloClient = new ApolloClient({
  link: getLink(),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
}); 