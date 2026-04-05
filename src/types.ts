export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
  isStarred?: boolean;
  note?: string;
}

export type CalculatorMode = 'standard' | 'scientific' | 'converter' | 'graph' | 'notebook';

export interface CalculatorState {
  display: string;
  expression: string;
  result: string | null;
  history: HistoryItem[];
  memory: string;
  mode: CalculatorMode;
  theme: 'light' | 'dark' | 'midnight' | 'emerald';
}
