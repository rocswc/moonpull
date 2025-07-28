import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  subject?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

export interface ChatRoom {
  id: string;
  participants: User[];
  messages: ChatMessage[];
  isMinimized: boolean;
  unreadCount: number;
  typingUsers: string[];
}

export interface ChatRequest {
  id: string;
  from: User;
  to: User;
  timestamp: Date;
  status: 'pending' | 'accepted' | 'rejected';
}

interface ChatContextType {
  users: User[];
  chatRooms: ChatRoom[];
  chatRequests: ChatRequest[];
  isUserListOpen: boolean;
  sendChatRequest: (toUserId: string) => void;
  acceptChatRequest: (requestId: string) => void;
  rejectChatRequest: (requestId: string) => void;
  sendMessage: (roomId: string, content: string) => void;
  minimizeChat: (roomId: string) => void;
  closeChat: (roomId: string) => void;
  setTyping: (roomId: string, isTyping: boolean) => void;
  markAsRead: (roomId: string) => void;
  toggleUserList: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// Mock users for demo
const mockUsers: User[] = [
  { id: '1', name: '김역사', avatar: '김', isOnline: true, subject: '한국사' },
  { id: '2', name: '이선생', avatar: '이', isOnline: true, subject: '한국사' },
  { id: '3', name: '박교수', avatar: '박', isOnline: false, subject: '한국사' },
  { id: '4', name: '최국어', avatar: '최', isOnline: true, subject: '국어' },
  { id: '5', name: '정선생', avatar: '정', isOnline: true, subject: '국어' },
  { id: '6', name: 'Smith', avatar: 'S', isOnline: false, subject: '영어' },
  { id: '7', name: '김영어', avatar: '김', isOnline: true, subject: '영어' },
  { id: '8', name: 'Johnson', avatar: 'J', isOnline: true, subject: '영어' },
];

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users] = useState<User[]>(mockUsers);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [chatRequests, setChatRequests] = useState<ChatRequest[]>([]);
  const [isUserListOpen, setIsUserListOpen] = useState(false);

  const currentUserId = 'current-user'; // Mock current user

  const sendChatRequest = (toUserId: string) => {
    const fromUser = { id: currentUserId, name: '나', avatar: '나', isOnline: true };
    const toUser = users.find(u => u.id === toUserId);
    
    if (toUser) {
      const newRequest: ChatRequest = {
        id: Date.now().toString(),
        from: fromUser,
        to: toUser,
        timestamp: new Date(),
        status: 'pending'
      };
      
      setChatRequests(prev => [...prev, newRequest]);
    }
  };

  const acceptChatRequest = (requestId: string) => {
    const request = chatRequests.find(r => r.id === requestId);
    if (request) {
      // Create new chat room
      const newRoom: ChatRoom = {
        id: Date.now().toString(),
        participants: [request.from, request.to],
        messages: [],
        isMinimized: false,
        unreadCount: 0,
        typingUsers: []
      };
      
      setChatRooms(prev => [...prev, newRoom]);
      setChatRequests(prev => prev.filter(r => r.id !== requestId));
    }
  };

  const rejectChatRequest = (requestId: string) => {
    setChatRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const sendMessage = (roomId: string, content: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUserId,
      content,
      timestamp: new Date(),
      isRead: false
    };

    setChatRooms(prev => prev.map(room => 
      room.id === roomId 
        ? { ...room, messages: [...room.messages, newMessage] }
        : room
    ));

    // Simulate response from other user
    setTimeout(() => {
      const responses = [
        "네, 좋은 질문이네요!",
        "자세히 설명해드릴게요.",
        "그 부분은 중요한 내용입니다.",
        "추가로 궁금한 점이 있으시면 언제든 물어보세요."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      const responseMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        senderId: 'other-user',
        content: randomResponse,
        timestamp: new Date(),
        isRead: false
      };

      setChatRooms(prev => prev.map(room => 
        room.id === roomId 
          ? { 
              ...room, 
              messages: [...room.messages, responseMessage],
              unreadCount: room.isMinimized ? room.unreadCount + 1 : room.unreadCount
            }
          : room
      ));
    }, 1000 + Math.random() * 2000);
  };

  const minimizeChat = (roomId: string) => {
    setChatRooms(prev => prev.map(room => 
      room.id === roomId ? { ...room, isMinimized: !room.isMinimized } : room
    ));
  };

  const closeChat = (roomId: string) => {
    setChatRooms(prev => prev.filter(room => room.id !== roomId));
  };

  const setTyping = (roomId: string, isTyping: boolean) => {
    // Implementation for typing indicators
    console.log(`User ${isTyping ? 'started' : 'stopped'} typing in room ${roomId}`);
  };

  const markAsRead = (roomId: string) => {
    setChatRooms(prev => prev.map(room => 
      room.id === roomId ? { ...room, unreadCount: 0 } : room
    ));
  };

  const toggleUserList = () => {
    setIsUserListOpen(prev => !prev);
  };

  return (
    <ChatContext.Provider value={{
      users,
      chatRooms,
      chatRequests,
      isUserListOpen,
      sendChatRequest,
      acceptChatRequest,
      rejectChatRequest,
      sendMessage,
      minimizeChat,
      closeChat,
      setTyping,
      markAsRead,
      toggleUserList
    }}>
      {children}
    </ChatContext.Provider>
  );
};