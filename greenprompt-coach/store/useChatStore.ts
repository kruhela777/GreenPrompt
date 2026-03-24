'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import { Chat, Message, Platform } from '@/types/chat';

interface ChatState {
  chats: Chat[];
  activeChatId: string | null;

  createChat: (platform?: Platform) => void;
  setActiveChat: (id: string) => void;
  addMessageToActive: (message: Message) => void;
  overwriteChatMessages: (chatId: string, messages: Message[]) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: [],
      activeChatId: null,

      createChat: (platform = 'greenprompt') => {
        const newChat: Chat = {
          id: uuid(),
          title: 'New chat',
          platform,
          messages: [],
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          chats: [newChat, ...state.chats],
          activeChatId: newChat.id,
        }));
      },

      setActiveChat: (id) => {
        const exists = get().chats.some((c) => c.id === id);
        if (!exists) return;
        set({ activeChatId: id });
      },

      addMessageToActive: (message) => {
        const { chats, activeChatId } = get();
        if (!activeChatId) return;

        const updatedChats = chats.map((chat) =>
          chat.id === activeChatId
            ? {
                ...chat,
                messages: [...chat.messages, message],
                // first user message sets title, like ChatGPT
                title:
                  chat.messages.length === 0 && message.role === 'user'
                    ? message.content.slice(0, 40) || 'New chat'
                    : chat.title,
              }
            : chat,
        );

        // move active chat to top
        const active = updatedChats.find((c) => c.id === activeChatId)!;
        const rest = updatedChats.filter((c) => c.id !== activeChatId);

        set({ chats: [active, ...rest] });
      },

      overwriteChatMessages: (chatId, messages) => {
        const { chats } = get();
        const updatedChats = chats.map((chat) =>
          chat.id === chatId ? { ...chat, messages } : chat,
        );

        const active = updatedChats.find((c) => c.id === chatId);
        const rest = updatedChats.filter((c) => c.id !== chatId);
        if (active) set({ chats: [active, ...rest] });
        else set({ chats: updatedChats });
      },
    }),
    {
      name: 'greenprompt-chats',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        chats: state.chats,
        activeChatId: state.activeChatId,
      }),
    },
  ),
);
