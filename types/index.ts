export type Role = "ADMIN" | "STUDENT" | "MANAGER" | "INSTRUCTOR" | "NON_EDITING_INSTRUCTOR"

export const isValidRole = (role: string): role is Role => {
  return ["ADMIN", "STUDENT", "MANAGER", "INSTRUCTOR", "NON_EDITING_INSTRUCTOR"].includes(role)
}

export interface Subfolder {
  id: string;
  name: string;
}

export interface Folder {
  id: string;
  name: string;
  subfolders: Subfolder[];
}

// Question Types
export type QuestionType = "MCQ" | "CODING"
export type QuestionStatus = "DRAFT" | "READY"
export type QuestionDifficulty = "EASY" | "MEDIUM" | "HARD"
export type ProgrammingLanguage = "C" | "CPP" | "JAVA" | "PYTHON2" | "PYTHON3" | "GO" | "JAVASCRIPT" | "RUBY"

export interface MCQOption {
  id: string;
  text: string;
  grade: number;
  feedback?: string;
}

export interface MCQQuestion {
  id: string;
  questionText: string;
  defaultMark: number;
  shuffleChoice: boolean;
  isMultiple: boolean;
  difficulty: QuestionDifficulty;
  tags: string[];
  generalFeedback?: string;
  options: MCQOption[];
}

export interface LanguageOption {
  id: string;
  language: ProgrammingLanguage;
  preloadCode?: string;
  solution?: string;
}

export interface TestCase {
  id: string;
  input: string;
  output: string;
  isSample: boolean;
  isHidden: boolean;
  showOnFailure: boolean;
}

export interface CodingQuestion {
  id: string;
  questionText: string;
  defaultMark: number;
  languageOptions: LanguageOption[];
  testCases: TestCase[];
}

export interface Question {
  id: string;
  name: string;
  type: QuestionType;
  status: QuestionStatus;
  folderId: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  lastModifiedByName?: string;
  mCQQuestion?: MCQQuestion;
  codingQuestion?: CodingQuestion;
  versions?: QuestionVersion[];
}

export interface QuestionVersion {
  id: string;
  version: number;
  name: string;
  type: QuestionType;
  status: QuestionStatus;
  createdAt: string;
  updatedAt: string;
  content: any; // This will store the full question data at this version
} 