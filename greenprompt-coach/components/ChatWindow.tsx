'use client';

import { useState, useEffect, useRef } from 'react';
import { Chat, Message } from '@/types/chat';
import MessageBubble from './MessageBubble';
import { Send, Share2, Trash2, Sparkles } from 'lucide-react';
import { generatePromptVariants } from '@/lib/promptOptimizer';
import PromptSuggestionsPanel from '@/components/PromptSuggestionsPanel';

interface ChatWindowProps {
  selectedChat: Chat | null;
  isSidebarOpen: boolean;
  onDeleteChat: (id: string) => void;
  onUpdateChat: (chat: Chat) => void;
  onShareChat: (chat: Chat) => void;
}

export default function ChatWindow({
  selectedChat,
  isSidebarOpen,
  onDeleteChat,
  onUpdateChat,
  onShareChat,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  /* -----------------------------
     LOAD SELECTED CHAT
  ------------------------------*/
  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages ?? []);
    } else {
      setMessages([]);
    }

    setInput('');
    setIsLoading(false);

    if (textareaRef.current) textareaRef.current.style.height = '56px';
  }, [selectedChat?.id]);

  /* -----------------------------
     AUTO SCROLL
  ------------------------------*/
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  /* -----------------------------
     INPUT RESIZE
  ------------------------------*/
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 320) + 'px';
    }
  };

  /* -----------------------------
     SUBMIT (REAL AI CONNECTED)
  ------------------------------*/
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedChat) return;

    setIsLoading(true);

    try {
      // 🔥 Generate optimized prompt
      const variants = generatePromptVariants(input.trim());
      const optimizedPrompt =
        variants.length > 0 ? variants[0].prompt : input.trim();

      const userMessage: Message = {
        id: crypto.randomUUID(),
        content: optimizedPrompt,
        role: 'user',
        createdAt: new Date().toISOString(),
      };

      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput('');

      if (textareaRef.current) textareaRef.current.style.height = '56px';

      const updatedChat: Chat = {
        ...selectedChat,
        messages: newMessages,
        title:
          selectedChat.messages.length === 0
            ? input.trim().slice(0, 40) || 'New chat'
            : selectedChat.title,
      };

      onUpdateChat(updatedChat);

      // 🔥 CALL BACKEND API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('AI response failed');
      }

      const data = await response.json();

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        content: data.reply?.content || 'No response received.',
        role: 'assistant',
        createdAt: new Date().toISOString(),
      };

      const finalMessages = [...newMessages, aiMessage];

      setMessages(finalMessages);

      onUpdateChat({
        ...updatedChat,
        messages: finalMessages,
      });
    } catch (error) {
      console.error('Chat error:', error);

      const errorMessage: Message = {
        id: crypto.randomUUID(),
        content:
          '⚠️ Something went wrong while contacting the AI. Please try again.',
        role: 'assistant',
        createdAt: new Date().toISOString(),
      };

      const errorMessages = [...messages, errorMessage];
      setMessages(errorMessages);
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedChat) {
    return (
      <div
        className={`flex-1 flex flex-col ${
          isSidebarOpen ? 'lg:ml-72' : 'lg:ml-0'
        }`}
      >
        <div className="flex-1 flex items-center justify-center px-4 text-center">
          <div>
            <div className="w-20 h-20 mx-auto mb-6 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl">
              <Send className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">
              GreenPrompt Coach
            </h2>
            <p className="text-gray-400 max-w-sm mx-auto">
              Select a chat or start a new one from the sidebar.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleShare = () => onShareChat(selectedChat);
  const handleDelete = () => {
    if (confirm('Delete this chat?')) onDeleteChat(selectedChat.id);
  };

  return (
    <>
      <div
        className={`flex-1 flex flex-col ${
          isSidebarOpen ? 'lg:ml-72' : 'lg:ml-0'
        }`}
      >
        {/* HEADER */}
        <div className="px-4 py-3 flex items-center justify-between border-b">
          <span className="text-sm font-semibold truncate">
            {selectedChat.title || 'New chat'}
          </span>

          <div className="flex items-center gap-3">
            <button onClick={handleShare}>
              <Share2 className="w-4 h-4" />
            </button>
            <button onClick={handleDelete}>
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>

        {/* MESSAGES */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 pt-4 pb-24 flex flex-col items-center"
        >
          <div className="w-full max-w-3xl space-y-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {isLoading && (
              <MessageBubble
                message={{
                  id: 'loading',
                  content: '',
                  role: 'assistant',
                  createdAt: new Date().toISOString(),
                }}
                isLoading
              />
            )}
          </div>
        </div>

        {/* INPUT */}
        <form onSubmit={handleSubmit} className="px-4 pb-6 pt-2">
          <div className="max-w-3xl mx-auto flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              placeholder="Message Coach"
              className="flex-1 min-h-[56px] max-h-80 resize-none px-4 py-3 rounded-2xl border"
              rows={1}
            />

            <button
              type="button"
              onClick={() => setShowSuggestions(true)}
              disabled={!input.trim()}
            >
              <Sparkles className="w-4 h-4" />
            </button>

            <button type="submit" disabled={!input.trim()}>
              <Send className="w-4 h-4 rotate-45 scale-110" />
            </button>
          </div>
        </form>
      </div>

      <PromptSuggestionsPanel
        input={input}
        isOpen={showSuggestions}
        onClose={() => setShowSuggestions(false)}
        onUsePrompt={(prompt) => {
          setInput(prompt);
          setShowSuggestions(false);
          textareaRef.current?.focus();
        }}
      />
    </>
  );
}