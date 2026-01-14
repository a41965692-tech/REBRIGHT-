
import { User, ApiKey, Conversation, Message } from '../types';

const STORAGE_KEYS = {
  USER: 'rebright_current_user',
  CONVERSATIONS: 'rebright_conversations',
  API_KEYS: 'rebright_api_keys'
};

export const storage = {
  // User Profile
  getUser: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  },
  setUser: (user: User | null) => {
    if (user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEYS.USER);
  },

  // Conversations
  getConversations: (): Conversation[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    return data ? JSON.parse(data) : [];
  },
  saveConversation: (conv: Conversation) => {
    const conversations = storage.getConversations();
    const index = conversations.findIndex(c => c.id === conv.id);
    if (index > -1) {
      conversations[index] = conv;
    } else {
      conversations.unshift(conv);
    }
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
  },

  // API Keys
  getApiKeys: (): ApiKey[] => {
    const data = localStorage.getItem(STORAGE_KEYS.API_KEYS);
    return data ? JSON.parse(data) : [];
  },
  saveApiKey: (key: ApiKey) => {
    const keys = storage.getApiKeys();
    keys.unshift(key);
    localStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(keys));
  },
  revokeApiKey: (id: string) => {
    const keys = storage.getApiKeys();
    const updated = keys.map(k => k.id === id ? { ...k, status: 'revoked' as const } : k);
    localStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(updated));
  }
};
