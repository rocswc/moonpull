import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  subject?: string;
  mentorId?: number; 
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
  currentUser: User;
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
  reportUser: (targetUser: User) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);



export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
 const [users, setUsers] = useState<User[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [chatRequests, setChatRequests] = useState<ChatRequest[]>([]);
  const [isUserListOpen, setIsUserListOpen] = useState(false);

  const currentUser: User = {
    id: '1', // TODO: 실제 로그인 사용자 ID와 연동 필요
    name: '나',
    avatar: '나',
    isOnline: true
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:8080/users/all");
        const data = await res.json();

        // ✅ 변환 작업 (MemberVO -> User)
        const converted: User[] = data.map((user: any) => ({
          id: user.userId.toString(),
          name: user.name,
          avatar: user.name?.charAt(0) || "👤",
          isOnline: true, // 백엔드에서 이 필드 없으니 기본값 true
          subject: user.major || undefined,
          mentorId: user.roles === "MENTOR" ? user.userId : undefined
        }));

        setUsers(converted);
      } catch (err) {
        console.error("유저 불러오기 실패", err);
      }
    };

    fetchUsers();
  }, []);

  const sendChatRequest = (toUserId: string) => {
    const toUser = users.find(u => u.id === toUserId);
    if (!toUser) return;

    const newRequest: ChatRequest = {
      id: Date.now().toString(),
      from: currentUser,
      to: toUser,
      timestamp: new Date(),
      status: 'pending'
    };

    setChatRequests(prev => [...prev, newRequest]);
  };

  const acceptChatRequest = (requestId: string) => {
    const request = chatRequests.find(r => r.id === requestId);
    if (!request) return;

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
  };

  const rejectChatRequest = (requestId: string) => {
    setChatRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const sendMessage = (roomId: string, content: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      content,
      timestamp: new Date(),
      isRead: false
    };

    setChatRooms(prev =>
      prev.map(room =>
        room.id === roomId
          ? { ...room, messages: [...room.messages, newMessage] }
          : room
      )
    );
  };

  const minimizeChat = (roomId: string) => {
    setChatRooms(prev =>
      prev.map(room =>
        room.id === roomId
          ? { ...room, isMinimized: !room.isMinimized }
          : room
      )
    );
  };

  const closeChat = (roomId: string) => {
    setChatRooms(prev => prev.filter(room => room.id !== roomId));
  };

  const setTyping = (roomId: string, isTyping: boolean) => {
    console.log(`Typing status in room ${roomId}: ${isTyping}`);
  };

  const markAsRead = (roomId: string) => {
    setChatRooms(prev =>
      prev.map(room =>
        room.id === roomId
          ? { ...room, unreadCount: 0 }
          : room
      )
    );
  };

  const toggleUserList = () => {
    setIsUserListOpen(prev => !prev);
  };

  const reportUser = async (targetUser: User) => {
    const reason = window.prompt(`"${targetUser.name}"님을 신고하는 이유를 입력하세요:`);

    if (!reason || reason.trim() === "") {
      alert("신고 사유를 입력해야 합니다.");
      return;
    }

    try {
      // 명확한 타입 지정
      const reportData: {
        reporterId: string;
        reason: string;
        targetUserId?: string;
        targetMentorId?: number;
      } = {
        reporterId: currentUser.id,
        reason
      };

	  if (targetUser.id !== undefined && targetUser.id !== "0") {
	    reportData.targetUserId = targetUser.id;
	  }

      if (targetUser.mentorId !== undefined) {
        reportData.targetMentorId = targetUser.mentorId;
      }

      await fetch("/api/admin/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
		credentials: "include",
        body: JSON.stringify(reportData)
      });

      alert("신고가 정상적으로 접수되었습니다.");
    } catch (err) {
      console.error("신고 실패", err);
      alert("신고 처리 중 오류가 발생했습니다.");
    }
  };


  return (
    <ChatContext.Provider
      value={{
        currentUser,
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
        toggleUserList,
        reportUser
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
