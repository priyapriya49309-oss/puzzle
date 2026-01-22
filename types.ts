
export interface Tile {
  id: number;
  currentPos: number;
  correctPos: number;
  isEmpty: boolean;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GameSettings {
  gridSize: number;
  theme: string;
  difficulty: Difficulty;
}

export type GameStatus = 'idle' | 'generating' | 'playing' | 'solved';

export interface ThemeOption {
  id: string;
  label: string;
  promptPrefix: string;
  color: string;
}
