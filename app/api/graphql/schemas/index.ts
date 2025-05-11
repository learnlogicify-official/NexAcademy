import { gql } from '@apollo/client';
import { questionTypeDefs } from './questionSchema';
import { codeExecutionTypeDefs } from './codeExecutionSchema';
import { submissionTypeDefs } from './submissionSchema';
import { codeDraftTypeDefs } from './codeDraftSchema';

// Define the base schema with Query and Mutation types
const baseTypeDefs = gql`
  type Query {
    _empty: String
  }
  
  type Mutation {
    _empty: String
  }
`;

// Combine all schema definitions
export const typeDefs = [
  baseTypeDefs,
  questionTypeDefs,
  codeExecutionTypeDefs,
  submissionTypeDefs,
  codeDraftTypeDefs,
]; 