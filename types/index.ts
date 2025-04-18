export type Role = "ADMIN" | "STUDENT" | "MANAGER" | "INSTRUCTOR" | "NON_EDITING_INSTRUCTOR"

export const isValidRole = (role: string): role is Role => {
  return ["ADMIN", "STUDENT", "MANAGER", "INSTRUCTOR", "NON_EDITING_INSTRUCTOR"].includes(role)
}

export interface Question {
  id: string;
  question: string;
  type: 'MULTIPLE_CHOICE' | 'CODING';
  folderId: string;
  subfolderId?: string;
  options?: string[];
  correctAnswer?: string;
  testCases?: any[];
  expectedOutput?: string;
  hidden?: boolean;
  marks?: number;
  singleAnswer?: boolean;
  shuffleAnswers?: boolean;
  status?: 'DRAFT' | 'READY';
  createdAt: string;
  updatedAt: string;
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