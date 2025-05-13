import { gql } from "@apollo/client";
import { apolloClient } from "../apollo-client";
import { ApolloError } from "@apollo/client";

// Define GraphQL queries
const GET_PROBLEM_SUBMISSIONS = gql`
  query GetProblemSubmissions(
    $problemId: ID!
    $userId: ID
    $page: Int
    $pageSize: Int
  ) {
    problemSubmissions(
      problemId: $problemId
      userId: $userId
      page: $page
      pageSize: $pageSize
    ) {
      submissions {
        id
        userId
        problemId
        language
        code
        submittedAt
        testcasesPassed
        totalTestcases
        allPassed
        runtime
        memory
        status
        user {
          id
          name
          email
        }
      }
      total
      page
      pageSize
      totalPages
    }
  }
`;

export const submissionService = {
  // Get problem submissions with pagination
  getProblemSubmissions: async (params: {
    problemId: string;
    userId?: string;
    page?: number;
    pageSize?: number;
  }) => {
    
    try {
      // Make sure problemId is not undefined
      if (!params.problemId) {
        console.error('Problem ID is undefined');
        throw new Error('Problem ID is required');
      }
      
      const { data } = await apolloClient.query({
        query: GET_PROBLEM_SUBMISSIONS,
        variables: params,
        fetchPolicy: 'network-only', // Don't use cache for this query
      });
      
      
      if (!data?.problemSubmissions) {
        console.error('Missing problemSubmissions in GraphQL response');
        throw new Error('Invalid response from server');
      }
      
      return data.problemSubmissions;
    } catch (error: unknown) {
      console.error("Error fetching problem submissions:", error);
      
      // Enhance error with more details
      if (error instanceof ApolloError) {
        if (error.graphQLErrors) {
          console.error('GraphQL Errors:', error.graphQLErrors);
        }
        
        if (error.networkError) {
          console.error('Network Error:', error.networkError);
        }
      }
      
      throw error;
    }
  },
}; 