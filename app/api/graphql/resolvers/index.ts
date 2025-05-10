import { questionResolvers } from './questionResolvers';
import { codeExecutionResolvers } from './codeExecutionResolvers';
import { submissionResolvers } from './submissionResolvers';
import { merge } from 'lodash';

// Merge all resolvers
export const resolvers = merge(
  questionResolvers,
  codeExecutionResolvers,
  submissionResolvers
); 