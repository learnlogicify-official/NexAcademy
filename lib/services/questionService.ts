import { gql } from "@apollo/client";
import { apolloClient } from "../apollo-client";

// Define GraphQL queries
const GET_QUESTIONS = gql`
  query GetQuestions(
    $type: QuestionType
    $status: QuestionStatus
    $folderId: ID
    $search: String
    $page: Int
    $limit: Int
    $includeSubcategories: Boolean
    $tagIds: [ID!]
  ) {
    questions(
      type: $type
      status: $status
      folderId: $folderId
      search: $search
      page: $page
      limit: $limit
      includeSubcategories: $includeSubcategories
      tagIds: $tagIds
    ) {
      questions {
        id
        name
        type
        status
        folderId
        version
        creatorName
        lastModifiedByName
        createdAt
        updatedAt
        tags {
          id
          name
        }
        folder {
          id
          name
        }
        codingQuestion {
          id
          questionText
          defaultMark
          difficulty
          isAllOrNothing
          defaultLanguage
          languageOptions {
            id
            language
            preloadCode
            solution
          }
          testCases {
            id
            input
            output
            isSample
            isHidden
            showOnFailure
            gradePercentage
          }
          tags {
            id
            name
          }
        }
        mCQQuestion {
          id
          questionText
          defaultMark
          shuffleChoice
          isMultiple
          tags
          generalFeedback
          difficulty
          options {
            id
            text
            grade
            feedback
          }
        }
      }
      totalCount
    }
  }
`;

const GET_QUESTION = gql`
  query GetQuestion($id: ID!) {
    question(id: $id) {
      id
      name
      type
      status
      folderId
      version
      creatorName
      lastModifiedByName
      createdAt
      updatedAt
      folder {
        id
        name
      }
      codingQuestion {
        id
        questionText
        defaultMark
        difficulty
        isAllOrNothing
        defaultLanguage
        languageOptions {
          id
          language
          preloadCode
          solution
        }
        testCases {
          id
          input
          output
          isSample
          isHidden
          showOnFailure
          gradePercentage
        }
        tags {
          id
          name
        }
      }
      mCQQuestion {
        id
        questionText
        defaultMark
        shuffleChoice
        isMultiple
        tags
        generalFeedback
        difficulty
        options {
          id
          text
          grade
          feedback
        }
      }
    }
  }
`;

const GET_FOLDERS = gql`
  query GetFolders {
    folders {
      id
      name
      parentId
      createdAt
      updatedAt
      subfolders {
        id
        name
      }
    }
  }
`;

const GET_TAGS = gql`
  query GetTags {
    tags {
      id
      name
      description
    }
  }
`;

const GET_JUDGE0_LANGUAGES = gql`
  query GetJudge0Languages {
    judge0Languages {
      id
      name
      is_archived
    }
  }
`;

const GET_EDITOR_DATA = gql`
  query GetEditorData {
    editorData {
      tags {
        id
        name
        description
      }
      judge0Languages {
        id
        name
        is_archived
      }
    }
  }
`;

const GET_QUESTION_STATS = gql`
  query GetQuestionStats(
    $type: QuestionType
    $status: QuestionStatus
    $folderId: ID
    $search: String
    $includeSubcategories: Boolean
    $tagIds: [ID!]
  ) {
    questionStats(
      type: $type
      status: $status
      folderId: $folderId
      search: $search
      includeSubcategories: $includeSubcategories
      tagIds: $tagIds
    ) {
      total
      readyCount
      draftCount
      mcqCount
      codingCount
    }
  }
`;

// Add new queries for problem detail and languages
const GET_PROBLEM_DETAIL = gql`
  query GetProblemDetail($id: ID!) {
    problemDetail(id: $id) {
      id
      title
      difficulty
      description
      tags {
        id
        name
      }
      sampleTestCases {
        id
        input
        output
        isSample
        isHidden
      }
      hiddenTestCases {
        id
        input
        output
        isSample
        isHidden
      }
      languageOptions {
        id
        language
        preloadCode
        solution
      }
    }
  }
`;

const GET_PROBLEM_LANGUAGES = gql`
  query GetProblemLanguages($id: ID!) {
    problemLanguages(id: $id) {
      id
      language
      name
      preloadCode
      solution
      createdAt
      updatedAt
    }
  }
`;

// Define GraphQL mutations
const CREATE_QUESTION = gql`
  mutation CreateQuestion($input: QuestionInput!) {
    createQuestion(input: $input) {
      id
      name
      type
      status
    }
  }
`;

const UPDATE_QUESTION = gql`
  mutation UpdateQuestion($id: ID!, $input: QuestionUpdateInput!) {
    updateQuestion(id: $id, input: $input) {
      id
      name
      type
      status
    }
  }
`;

const DELETE_QUESTION = gql`
  mutation DeleteQuestion($id: ID!) {
    deleteQuestion(id: $id)
  }
`;

const IMPORT_QUESTIONS_FROM_XML = gql`
  mutation ImportQuestionsFromXML($xmlContent: String!, $folderId: ID!) {
    importQuestionsFromXML(xmlContent: $xmlContent, folderId: $folderId) {
      id
      name
      type
      status
    }
  }
`;

const BULK_IMPORT_CODING_QUESTIONS = gql`
  mutation BulkImportCodingQuestions($questions: [QuestionInput!]!) {
    bulkImportCodingQuestions(questions: $questions) {
      id
      name
      type
      status
    }
  }
`;

// Question service API
export const questionService = {
  // Get questions with pagination and filtering
  getQuestions: async (params: {
    type?: string;
    status?: string;
    folderId?: string;
    search?: string;
    page?: number;
    limit?: number;
    includeSubcategories?: boolean;
    tagIds?: string[];
  }) => {
    const { data } = await apolloClient.query({
      query: GET_QUESTIONS,
      variables: params,
      fetchPolicy: 'network-only',
    });
    return data.questions;
  },

  // Get a single question by ID
  getQuestion: async (id: string) => {
    const { data } = await apolloClient.query({
      query: GET_QUESTION,
      variables: { id },
      fetchPolicy: 'network-only',
    });
    return data.question;
  },

  // Get all folders
  getFolders: async () => {
    const { data } = await apolloClient.query({
      query: GET_FOLDERS,
      fetchPolicy: 'network-only',
    });
    return data.folders;
  },

  // Get all tags
  getTags: async () => {
    const { data } = await apolloClient.query({
      query: GET_TAGS,
      fetchPolicy: 'network-only',
    });
    return data.tags;
  },

  // Get all Judge0 languages
  getJudge0Languages: async () => {
    const { data } = await apolloClient.query({
      query: GET_JUDGE0_LANGUAGES,
      fetchPolicy: 'network-only',
    });
    return data.judge0Languages;
  },

  // Get combined editor data (tags and Judge0 languages)
  getEditorData: async () => {
    const { data } = await apolloClient.query({
      query: GET_EDITOR_DATA,
      fetchPolicy: 'network-only',
    });
    return data.editorData;
  },

  // Create a new question
  createQuestion: async (input: any) => {
    const { data } = await apolloClient.mutate({
      mutation: CREATE_QUESTION,
      variables: { input },
    });
    return data.createQuestion;
  },

  // Update an existing question
  updateQuestion: async (id: string, input: any) => {
    const { data } = await apolloClient.mutate({
      mutation: UPDATE_QUESTION,
      variables: { id, input },
    });
    return data.updateQuestion;
  },

  // Delete a question
  deleteQuestion: async (id: string) => {
    const { data } = await apolloClient.mutate({
      mutation: DELETE_QUESTION,
      variables: { id },
    });
    return data.deleteQuestion;
  },

  // Import questions from XML
  importQuestionsFromXML: async (xmlContent: string, folderId: string) => {
    const { data } = await apolloClient.mutate({
      mutation: IMPORT_QUESTIONS_FROM_XML,
      variables: { xmlContent, folderId },
    });
    return data.importQuestionsFromXML;
  },

  // Get question statistics without fetching all questions
  getQuestionStats: async (params: {
    type?: string;
    status?: string;
    folderId?: string;
    search?: string;
    includeSubcategories?: boolean;
    tagIds?: string[];
  }) => {
    try {
      const { data } = await apolloClient.query({
        query: GET_QUESTION_STATS,
        variables: params,
        fetchPolicy: 'network-only',
      });
      
      // Map the response to the format expected by the component
      return {
        stats: {
          MCQ: data.questionStats.mcqCount,
          CODING: data.questionStats.codingCount,
          READY: data.questionStats.readyCount,
          DRAFT: data.questionStats.draftCount
        },
        total: data.questionStats.total
      };
    } catch (error) {
      console.error("Error fetching question stats:", error);
      // Return an empty object if the query fails
      return { stats: null };
    }
  },

  // Bulk import multiple coding questions
  bulkImportCodingQuestions: async (questions: any[]) => {
    
    
  
    
    try {
      const { data } = await apolloClient.mutate({
        mutation: BULK_IMPORT_CODING_QUESTIONS,
        variables: { questions },
      });
      
      
      return data.bulkImportCodingQuestions;
    } catch (error) {
  
      throw error;
    }
  },

  // Get problem detail using the new GraphQL endpoint
  getProblemDetail: async (id: string) => {
    const { data } = await apolloClient.query({
      query: GET_PROBLEM_DETAIL,
      variables: { id },
      fetchPolicy: 'network-only',
    });
    return data.problemDetail;
  },

  // Get problem languages using the new GraphQL endpoint
  getProblemLanguages: async (id: string) => {
    const { data } = await apolloClient.query({
      query: GET_PROBLEM_LANGUAGES,
      variables: { id },
      fetchPolicy: 'network-only',
    });
    return data.problemLanguages;
  },
}; 