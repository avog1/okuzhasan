
export interface StorySegment {
  text: string;
  visualDescription: string;
  role: 'user' | 'model';
}

export interface GameState {
  history: StorySegment[];
  isStarted: boolean;
  isLoading: boolean;
  error: string | null;
}
