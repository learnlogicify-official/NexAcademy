import { gql } from '@apollo/client';

export const codeDraftTypeDefs = gql`
  type UserCodeDraft {
    id: ID!
    userId: String!
    problemId: String!
    language: String!
    code: String!
    updatedAt: String!
    createdAt: String!
  }

  type CodeDraftResponse {
    success: Boolean!
    message: String!
    draft: UserCodeDraft
  }

  input SaveCodeDraftInput {
    userId: String!
    problemId: String!
    language: String!
    code: String!
  }

  input SaveUserProblemSettingsInput {
    userId: String!
    problemId: String!
    lastLanguage: String!
  }

  type SaveUserProblemSettingsResponse {
    success: Boolean!
    message: String!
  }

  type UserProblemSettings {
    lastLanguage: String!
  }

  extend type Query {
    getUserCodeDraft(userId: String!, problemId: String!, language: String!): UserCodeDraft
    getAllUserCodeDrafts(userId: String!, problemId: String!): [UserCodeDraft!]!
    getUserProblemSettings(userId: String!, problemId: String!): UserProblemSettings
  }

  extend type Mutation {
    saveCodeDraft(input: SaveCodeDraftInput!): CodeDraftResponse!
    saveUserProblemSettings(input: SaveUserProblemSettingsInput!): SaveUserProblemSettingsResponse!
  }
`; 