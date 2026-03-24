'use client';

import { ReactNode } from 'react';
import { PanelLeft, UserCircle } from 'lucide-react';
import { Chat } from '@/types/chat';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  chats: Chat[];
  selectedChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
}

export default function Sidebar({
  isOpen,
  onToggle,
  chats,
  selectedChatId,
  onNewChat,
  onSelectChat,
}: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={onToggle}
        />
      )}

      <div
        className={`
          fixed inset-y-0 left-0 z-40 w-72
          bg-[hsl(var(--color-card))] border-r border-[hsl(var(--color-border))]
          flex flex-col transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="px-3 py-3 border-b border-[hsl(var(--color-border))] flex items-center gap-2">
          <button
            type="button"
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-white/5 text-gray-300 lg:hidden"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-gray-100">
            GreenPrompt Coach
          </span>
        </div>

        <div className="p-3">
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md
                       bg-emerald-500 text-sm font-medium text-white hover:bg-emerald-600
                       transition-colors"
          >
            New Chat
          </button>
        </div>

        {/* Chat history */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {chats.map(chat => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors truncate ${
                selectedChatId === chat.id
                  ? 'bg-emerald-600/20 text-emerald-400'
                  : 'hover:bg-white/5 text-gray-300'
              }`}
            >
              {chat.title || 'New chat'}
            </button>
          ))}
        </div>

        {/* Profile */}
        <div className="p-3 border-t border-[hsl(var(--color-border))] bg-black/40 flex-shrink-0">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
            <UserCircle className="w-7 h-7 text-gray-300" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-100 truncate">
                Kritika Ruhela
              </p>
              <p className="text-xs text-gray-500 truncate">
                Synced Account
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
