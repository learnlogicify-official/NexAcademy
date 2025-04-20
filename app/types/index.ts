export interface MCQOption {
  id: string;
  text: string;
  grade: number;
  feedback: string;
}

export interface MCQQuestion {
  id: string;
  questionText: string;
  options: MCQOption[];
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  defaultMark: number;
  isMultiple: boolean;
  shuffleChoice: boolean;
  generalFeedback: string;
  choiceNumbering: string;
}

export interface CodingQuestion {
  id: string;
  questionText: string;
  languageOptions: {
    id: string;
    language: string;
    solution: string;
  }[];
  testCases: {
    id: string;
    input: string;
    output: string;
    isHidden: boolean;
  }[];
}

export interface Question {
  id: string;
  name: string;
  type: 'MCQ' | 'CODING';
  status: 'DRAFT' | 'READY';
  version: number;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  creatorName: string;
  lastModifiedBy: string;
  lastModifiedByName: string;
  folderId: string;
  folder: Folder;
  mcqQuestion?: MCQQuestion;
  codingQuestion?: CodingQuestion;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  parent?: Folder;
  subfolders: Folder[];
  createdAt: string;
  updatedAt: string;
}

export interface QuestionFormData {
  id: string;
  name: string;
  type: 'MCQ' | 'CODING';
  status: 'DRAFT' | 'READY';
  folderId: string;
  version: number;
  questionText: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  defaultMark: number;
  isMultiple: boolean;
  shuffleChoice: boolean;
  generalFeedback: string;
  choiceNumbering: string;
  options: MCQOption[];
  languageOptions: {
    id: string;
    language: string;
    solution: string;
  }[];
  testCases: {
    id: string;
    input: string;
    output: string;
    isHidden: boolean;
  }[];
} 