import { gql } from '@apollo/client';

export const userTypeDefs = gql`
  # ... existing code ...

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

  # ... existing code ...

  # Query - get user XP and leaderboard
  extend type Query {
    # ... existing queries ...
    
    # Get current user's XP information
    myXP: UserXP!
    
    # Get XP leaderboard
    xpLeaderboard(limit: Int): [LeaderboardEntry!]!
  }
`; 