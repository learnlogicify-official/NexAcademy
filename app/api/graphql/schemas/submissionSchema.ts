import { gql } from '@apollo/client';

export const submissionTypeDefs = gql`
  type User {
    id: ID!
    name: String
    email: String
  }

  type ProblemSubmission {
    id: ID!
    userId: String!
    problemId: String!
    language: String!
    code: String!
    submittedAt: String!
    testcasesPassed: Int!
    totalTestcases: Int!
    allPassed: Boolean!
    runtime: String
    memory: String
    runtimePercentile: String
    memoryPercentile: String
    user: User
    status: String
  }

  type SubmissionsResponse {
    submissions: [ProblemSubmission!]!
    total: Int!
    page: Int!
    pageSize: Int!
    totalPages: Int!
  }

  extend type Query {
    problemSubmissions(
      problemId: ID!
      userId: ID
      page: Int
      pageSize: Int
    ): SubmissionsResponse!
  }
`; 