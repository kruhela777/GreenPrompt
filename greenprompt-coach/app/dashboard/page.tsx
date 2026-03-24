'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatWindow from '@/components/ChatWindow';
import { Chat } from '@/types/chat';

export default function DashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* -----------------------------------
     LOAD CHATS (Backend + Local Fallback)
  ------------------------------------*/
  useEffect(() => {
    const loadChats = async () => {
      try {
        const res = await fetch('/api/sync');
        const data = await res.json();

        let backendChats: Chat[] = [];

        if (Array.isArray(data)) {
          backendChats = data;
        }

        // If backend has chats → use them
        if (backendChats.length > 0) {
          setChats(backendChats);
          setSelectedChatId(backendChats[0]?.id ?? null);
        } else {
          // Otherwise fallback to localStorage
          const stored = localStorage.getItem('greenprompt-chats');
          if (stored) {
            const parsed: Chat[] = JSON.parse(stored);
            setChats(parsed);
            setSelectedChatId(parsed[0]?.id ?? null);
          }
        }
      } catch (err) {
        console.error('Failed to load chats:', err);

        // Fallback to local if backend fails
        const stored = localStorage.getItem('greenprompt-chats');
        if (stored) {
          const parsed: Chat[] = JSON.parse(stored);
          setChats(parsed);
          setSelectedChatId(parsed[0]?.id ?? null);
        }
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, []);

  /* -----------------------------------
     SAVE LOCAL CHANGES
  ------------------------------------*/
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('greenprompt-chats', JSON.stringify(chats));
    }
  }, [chats, loading]);

  /* -----------------------------------
     SELECTED CHAT
  ------------------------------------*/
  const selectedChat =
    chats.find((c) => c.id === selectedChatId) || null;

  /* -----------------------------------
     CREATE NEW CHAT
  ------------------------------------*/
  const handleNewChat = () => {
    const newChat: Chat = {
      id: crypto.randomUUID(),
      title: 'New chat',
      platform: 'chatgpt',
      createdAt: new Date().toISOString(),
      messages: [],
    };

    const updated = [newChat, ...chats];
    setChats(updated);
    setSelectedChatId(newChat.id);
  };

  /* -----------------------------------
     SELECT CHAT
  ------------------------------------*/
  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  /* -----------------------------------
     DELETE CHAT
  ------------------------------------*/
  const handleDeleteChat = (id: string) => {
    const updated = chats.filter((c) => c.id !== id);
    setChats(updated);

    if (selectedChatId === id) {
      setSelectedChatId(updated[0]?.id ?? null);
    }
  };

  /* -----------------------------------
     UPDATE CHAT
  ------------------------------------*/
  const handleUpdateChat = (updatedChat: Chat) => {
    const updated = chats.map((c) =>
      c.id === updatedChat.id ? updatedChat : c
    );
    setChats(updated);
  };

  /* -----------------------------------
     SHARE CHAT
  ------------------------------------*/
  const handleShareChat = (chat: Chat) => {
    const fakeUrl = `${window.location.origin}/share/chat/${chat.id}`;
    navigator.clipboard.writeText(fakeUrl).catch(() => {});
    alert('Share link copied:\n' + fakeUrl);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading chats...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[hsl(var(--color-bg))] text-[hsl(var(--color-fg))]">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((o) => !o)}
        chats={chats}
        selectedChatId={selectedChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
      />

      <ChatWindow
        key={selectedChat?.id ?? 'empty'}
        selectedChat={selectedChat}
        isSidebarOpen={isSidebarOpen}
        onDeleteChat={handleDeleteChat}
        onUpdateChat={handleUpdateChat}
        onShareChat={handleShareChat}
      />
    </div>
  );
}