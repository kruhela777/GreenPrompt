'use client';

import { Chat } from '@/types/chat';
import { Clock } from 'lucide-react';

interface ChatListProps {
  chats: Chat[];
  onSelectChat: (chat: Chat | null) => void;
}

export default function ChatList({ chats, onSelectChat }: ChatListProps) {
  if (!chats.length) {
    return (
      <div className="p-8 text-center text-gray-500">
        <div className="w-16 h-16 mx-auto mb-4 bg-black/40 rounded-full flex items-center justify-center">
          <Clock className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-sm text-gray-300">No conversations yet</p>
        <p className="text-xs mt-1 text-gray-500">
          Start a new chat to see it here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1 p-1">
      {chats.map((chat) => {
        const createdDate = chat.createdAt
          ? new Date(chat.createdAt)
          : new Date();

        return (
          <button
            key={chat.id}
            onClick={() => onSelectChat(chat)}
            className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/5 rounded-lg transition-colors group"
          >
            <div className="w-2 h-2 bg-gray-500 rounded-full group-hover:bg-emerald-500 transition-colors flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-100 truncate text-sm">
                {chat.title || 'New chat'}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {chat.platform}
              </p>
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1 flex-shrink-0">
              <Clock className="w-3 h-3" />
              <span>
                {createdDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
