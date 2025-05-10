import { gql } from '@apollo/client';
import { questionTypeDefs } from './questionSchema';
import { codeExecutionTypeDefs } from './codeExecutionSchema';

// Update the base schema to include the userSubmissions query with pagination
export const baseTypeDefs = gql`
  type Query {
    _: Boolean
    userSubmissions(problemId: String!, page: Int, limit: Int): SubmissionResponse!
  }

  type Mutation {
    _: Boolean
  }
  
  type Subscription {
    _: Boolean
  }
  
  type ProblemSubmission {
    id: ID!
    userId: String!
    problemId: String!
    language: String!
    code: String!
    submittedAt: DateTime!
    testcasesPassed: Int!
    totalTestcases: Int!
    skippedTestcases: Int!
    allPassed: Boolean!
    runtime: String
    memory: String
    runtimePercentile: String
    memoryPercentile: String
  }
  
  type PaginationInfo {
    totalCount: Int!
    totalPages: Int!
    currentPage: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }
  
  type SubmissionResponse {
    submissions: [ProblemSubmission!]!
    pagination: PaginationInfo!
  }
  
  scalar DateTime
`;

// Combine all schema definitions
export const typeDefs = [
  baseTypeDefs,
  questionTypeDefs,
  codeExecutionTypeDefs,
]; 