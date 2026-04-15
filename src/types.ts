export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
  isStarred?: boolean;
  note?: string;
  category?: 'standard' | 'scientific' | 'financial' | 'converter' | 'smart';
  explanation?: string;
  steps?: string[];
}

export type CalculatorMode = 
  | 'standard' 
  | 'scientific' 
  | 'converter' 
  | 'graph' 
  | 'notebook' 
  | 'age' 
  | 'vault' 
  | 'financial' 
  | 'student' 
  | 'receipt'
  | 'smart';

export interface SecurityQuestion {
  question: string;
  answerHash: string;
}

export interface VaultConfig {
  authType: 'password' | 'pin';
  passwordHash: string;
  securityQuestions: SecurityQuestion[];
  isSetup: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface CalculatorState {
  display: string;
  expression: string;
  result: string | null;
  history: HistoryItem[];
  memory: string;
  mode: CalculatorMode;
  theme: 'light' | 'dark' | 'midnight' | 'emerald';
}
