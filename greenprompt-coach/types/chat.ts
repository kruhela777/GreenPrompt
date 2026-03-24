export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: string; // ISO string
}

export type Platform = 'chatgpt' | 'gpt' | 'perplexity' | 'claude' | 'greenprompt';

export interface Chat {
  id: string;
  title: string;
  platform: Platform;
  createdAt: string; // ISO string
  messages: Message[];
}
