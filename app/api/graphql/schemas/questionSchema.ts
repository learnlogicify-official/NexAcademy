import { gql } from '@apollo/client';

export const questionTypeDefs = gql`
  enum QuestionType {
    MCQ
    CODING
  }

  enum QuestionStatus {
    DRAFT
    READY
  }

  enum QuestionDifficulty {
    EASY
    MEDIUM
    HARD
    VERY_HARD
    EXTREME
  }

  enum UserProblemStatus {
    COMPLETED
    IN_PROGRESS
    NOT_STARTED
  }

  type Folder {
    id: ID!
    name: String!
    parentId: ID
    createdAt: String!
    updatedAt: String!
    subfolders: [Folder!]
  }

  type Tag {
    id: ID!
    name: String!
    description: String
    createdAt: String!
    updatedAt: String!
    _count: TagCount
  }

  type TagCount {
    codingQuestions: Int!
  }

  type TestCase {
    id: ID!
    input: String!
    output: String!
    isSample: Boolean!
    isHidden: Boolean!
    showOnFailure: Boolean!
    gradePercentage: Float!
    createdAt: String!
    updatedAt: String!
  }

  type LanguageOption {
    id: ID!
    language: String!
    preloadCode: String
    solution: String!
    name: String
    createdAt: String!
    updatedAt: String!
  }

  type CodingQuestion {
    id: ID!
    questionId: ID!
    questionText: String!
    defaultMark: Float!
    difficulty: QuestionDifficulty!
    isAllOrNothing: Boolean!
    defaultLanguage: String
    createdAt: String!
    updatedAt: String!
    languageOptions: [LanguageOption!]!
    testCases: [TestCase!]!
    tags: [Tag!]!
    question: Question
    userSubmissionStatus: UserSubmissionStatus
    solvedByCount: Int!
    totalSubmissions: Int!
    acceptedSubmissions: Int!
    accuracy: Float!
  }

  type MCQOption {
    id: ID!
    text: String!
    grade: Float!
    feedback: String
    createdAt: String!
    updatedAt: String!
  }

  type MCQQuestion {
    id: ID!
    questionId: ID!
    questionText: String!
    defaultMark: Float!
    shuffleChoice: Boolean!
    isMultiple: Boolean!
    tags: [String!]!
    generalFeedback: String
    difficulty: QuestionDifficulty!
    createdAt: String!
    updatedAt: String!
    options: [MCQOption!]!
  }

  type Question {
    id: ID!
    name: String!
    type: QuestionType!
    status: QuestionStatus!
    folderId: ID!
    version: Int!
    creatorId: String!
    creatorName: String!
    lastModifiedBy: String!
    lastModifiedByName: String!
    createdAt: String!
    updatedAt: String!
    folder: Folder
    tags: [Tag!]
    codingQuestion: CodingQuestion
    mCQQuestion: MCQQuestion
    solvedByCount: Int
    accuracy: Float
  }

  input TestCaseInput {
    id: ID
    input: String!
    output: String!
    isSample: Boolean!
    isHidden: Boolean!
    showOnFailure: Boolean!
    gradePercentage: Float!
  }

  input LanguageOptionInput {
    id: ID
    language: String!
    preloadCode: String
    solution: String!
  }

  input CodingQuestionInput {
    questionText: String!
    defaultMark: Float!
    difficulty: QuestionDifficulty!
    isAllOrNothing: Boolean!
    defaultLanguage: String
    languageOptions: [LanguageOptionInput!]!
    testCases: [TestCaseInput!]!
    tagIds: [ID!]
  }

  input MCQOptionInput {
    id: ID
    text: String!
    grade: Float!
    feedback: String
  }

  input MCQQuestionInput {
    questionText: String!
    defaultMark: Float!
    shuffleChoice: Boolean!
    isMultiple: Boolean!
    tags: [String!]
    generalFeedback: String
    difficulty: QuestionDifficulty!
    options: [MCQOptionInput!]!
  }

  input QuestionInput {
    name: String!
    type: QuestionType!
    status: QuestionStatus!
    folderId: ID!
    codingQuestion: CodingQuestionInput
    mCQQuestion: MCQQuestionInput
  }

  input QuestionUpdateInput {
    name: String
    status: QuestionStatus
    folderId: ID
    codingQuestion: CodingQuestionInput
    mCQQuestion: MCQQuestionInput
  }

  type QuestionsResponse {
    questions: [Question!]!
    totalCount: Int!
  }

  type Judge0Language {
    id: ID!
    name: String!
    is_archived: Boolean
  }

  type EditorData {
    tags: [Tag!]!
    judge0Languages: [Judge0Language!]!
  }

  type QuestionStats {
    total: Int!
    readyCount: Int!
    draftCount: Int!
    mcqCount: Int!
    codingCount: Int!
  }

  type UserProblemCounts {
    total: Int!
    completed: Int!
    inProgress: Int!
    notStarted: Int!
  }

  type UserSubmissionStatus {
    hasAccepted: Boolean!
    attemptCount: Int!
    lastSubmittedAt: String
  }

  type CodingQuestionsResponse {
    codingQuestions: [CodingQuestion!]!
    totalCount: Int!
  }

  type ProblemDetail {
    id: ID!
    number: Int
    title: String!
    difficulty: QuestionDifficulty!
    tags: [Tag!]!
    level: Int
    description: String!
    inputFormat: String
    outputFormat: String
    sampleTestCases: [TestCase!]!
    hiddenTestCases: [TestCase!]
    starterCode: String
    solution: String
    explanation: String
    xpReward: Int
    languageOptions: [LanguageOption!]!
  }

  extend type Query {
    questions(
      type: QuestionType
      status: QuestionStatus
      folderId: ID
      search: String
      page: Int
      limit: Int
      includeSubcategories: Boolean
      tagIds: [ID!]
      difficulty: QuestionDifficulty
    ): QuestionsResponse!
    
    codingQuestions(
      page: Int
      limit: Int
      search: String
      tagIds: [ID!]
      difficulty: QuestionDifficulty
      userStatus: UserProblemStatus
    ): CodingQuestionsResponse!
    
    question(id: ID!): Question
    
    questionStats(
      type: QuestionType
      status: QuestionStatus
      folderId: ID
      search: String
      includeSubcategories: Boolean
      tagIds: [ID!]
    ): QuestionStats!
    
    folders: [Folder!]!
    
    tags: [Tag!]!

    judge0Languages: [Judge0Language!]!
    
    editorData: EditorData!
    
    problemDetail(id: ID!): ProblemDetail
    
    problemLanguages(id: ID!): [LanguageOption!]!
    
    userProblemCounts: UserProblemCounts!
  }

  extend type Mutation {
    createQuestion(input: QuestionInput!): Question!
    
    updateQuestion(id: ID!, input: QuestionUpdateInput!): Question!
    
    deleteQuestion(id: ID!): Boolean!
    
    importQuestionsFromXML(xmlContent: String!, folderId: ID!): [Question!]!
    
    bulkImportCodingQuestions(questions: [QuestionInput!]!): [Question!]!
  }
`; 