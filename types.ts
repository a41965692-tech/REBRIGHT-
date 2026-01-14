
export enum AppView {
  CHAT = 'chat',
  RESEARCH = 'research',
  VISUALS = 'visuals',
  LIVE = 'live',
  SETTINGS = 'settings',
  PROFILE = 'profile',
  API_KEYS = 'api_keys'
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinedAt: number;
  preferences: {
    theme: 'light' | 'dark';
    language: 'english' | 'hinglish';
  };
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: number;
  lastUsedAt?: number;
  usageCount: number;
  status: 'active' | 'revoked';
}

export interface Conversation {
  id: string;
  title: string;
  view: AppView.CHAT | AppView.RESEARCH;
  messages: Message[];
  updatedAt: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  type?: 'text' | 'image' | 'video' | 'audio';
  mediaUrl?: string;
  groundingUrls?: string[];
}

export interface ResearchOptions {
  depth: 'fast' | 'quick' | 'deep';
  useSearch: boolean;
  useMaps: boolean;
}

export interface ImageGenOptions {
  prompt: string;
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
  imageSize: "1K" | "2K" | "4K";
}

export interface VideoGenOptions {
  prompt: string;
  aspectRatio: '16:9' | '9:16';
  resolution: '720p' | '1080p';
}
