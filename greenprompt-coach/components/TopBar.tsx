'use client';

import { Chat } from '@/types/chat';
import { ChevronLeft, MoreVertical } from 'lucide-react';

interface TopBarProps {
  chat: Chat;
}

export default function TopBar({ chat }: TopBarProps) {
  return (
    <div className="p-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full" />
            <div>
              <h2 className="font-semibold text-gray-900 truncate max-w-xs">{chat.title}</h2>
              <p className="text-sm text-gray-500 capitalize">{chat.platform}</p>
            </div>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <MoreVertical className="w-5 h-5 text-gray-500" />
        </button>
      </div>
    </div>
  );
}
