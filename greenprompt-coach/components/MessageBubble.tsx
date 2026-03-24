'use client';

import { Message } from '@/types/chat';
import { User, Bot } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isLoading?: boolean;
}

export default function MessageBubble({ message, isLoading = false }: MessageBubbleProps) {
  if (isLoading) {
    return (
      <div className="flex items-start">
        <div className="flex space-x-1 p-3 bg-gray-200 rounded-2xl rounded-tr-sm max-w-md">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0s]" />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]" />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
        </div>
      </div>
    );
  }

  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-3xl ${isUser ? 'order-2' : ''}`}>
        <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
          
          {/* Avatar */}
          <div
            className={`w-8 h-8 rounded-full flex-shrink-0 ${
              isUser
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 order-2'
                : 'bg-gray-300 order-1'
            }`}
          >
            {isUser ? (
              <User className="w-4 h-4 text-white m-auto" />
            ) : (
              <Bot className="w-4 h-4 text-gray-600 m-auto" />
            )}
          </div>

          {/* Message Bubble */}
          <div
            className={`p-4 rounded-2xl shadow-lg ${
              isUser
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-sm'
                : 'bg-white border text-black rounded-bl-sm'
            }`}
          >
            <p className="whitespace-pre-wrap leading-relaxed">
              {message.content}
            </p>

            <div
              className={`mt-2 pt-2 text-xs opacity-75 flex items-center gap-2 ${
                isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              {(() => {
                const date =
                  typeof message.createdAt === 'string'
                    ? new Date(message.createdAt)
                    : message.createdAt;
                return date.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });
              })()}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}