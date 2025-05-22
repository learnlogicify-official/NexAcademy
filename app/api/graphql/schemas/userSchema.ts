import { gql } from '@apollo/client';

export const userTypeDefs = gql`
  # Reference to User defined in other schemas
  # type User {
  #   id: ID!
  #   name: String
  #   email: String
  # }

  # XP Event type
  type XPEvent {
    id: ID!
    eventType: String!
    awardedXP: Int!
    description: String
    createdAt: String!
    questionId: String
  }

  # User XP information
  type UserXP {
    xp: Int!
    level: Int!
    events: [XPEvent!]!
  }

  # XP Leaderboard entry
  type LeaderboardEntry {
    user: User!
    xp: Int!
    level: Int!
  }

  # Platform Handle type
  type PlatformHandle {
    id: ID!
    platform: String!
    handle: String!
  }

  # User Stats - combined data needed across the application
  type UserStats {
    xp: Int!
    streak: Int!
    platformHandles: [PlatformHandle!]!
  }

  # Query - get user XP and leaderboard
  extend type Query {
    # Get current user's XP information
    myXP: UserXP!
    
    # Get XP leaderboard
    xpLeaderboard(limit: Int): [LeaderboardEntry!]!
    
    # Get combined user stats (xp, streak, platformHandles)
    userStats: UserStats!
  }
`; 