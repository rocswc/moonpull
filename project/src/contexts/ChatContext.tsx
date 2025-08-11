import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from "react";

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
  status: "pending" | "accepted" | "rejected";
}

interface ChatContextType {
  currentUser?: User; // 로그인 안 한 경우 undefined 허용
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
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [chatRequests, setChatRequests] = useState<ChatRequest[]>([]);
  const [isUserListOpen, setIsUserListOpen] = useState(false);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch("/api/user", { credentials: "include" });
        const user = await res.json();

        if (!user?.userId) {
          setCurrentUser(undefined); // 로그인 안 된 상태는 undefined
          return;
        }

        setCurrentUser({
          id: user.userId.toString(),
          name: user.name,
          avatar: user.name?.charAt(0) || "👤",
          isOnline: true,
          subject: user.major || undefined,
          mentorId: user.roles === "MENTOR" ? user.userId : undefined
        });
      } catch (err) {
        console.error("❌ 현재 로그인 유저 정보를 불러오지 못했습니다.", err);
        setCurrentUser(undefined);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:8080/users/all");
        const data = await res.json();

        const converted: User[] = data.map((user: any) => ({
          id: user.userId.toString(),
          name: user.name,
          avatar: user.name?.charAt(0) || "👤",
          isOnline: true,
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

  if (currentUser === null) return <div>로그인 정보를 불러오는 중입니다...</div>;

  const sendChatRequest = (toUserId: string) => {
    const toUser = users.find((u) => u.id === toUserId);
    if (!toUser) return;

    const newRequest: ChatRequest = {
      id: Date.now().toString(),
      from: currentUser!,
      to: toUser,
      timestamp: new Date(),
      status: "pending"
    };

    setChatRequests((prev) => [...prev, newRequest]);
  };

  const acceptChatRequest = (requestId: string) => {
    const request = chatRequests.find((r) => r.id === requestId);
    if (!request) return;

    const newRoom: ChatRoom = {
      id: Date.now().toString(),
      participants: [request.from, request.to],
      messages: [],
      isMinimized: false,
      unreadCount: 0,
      typingUsers: []
    };

    setChatRooms((prev) => [...prev, newRoom]);
    setChatRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  const rejectChatRequest = (requestId: string) => {
    setChatRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  const sendMessage = (roomId: string, content: string) => {
    if (!currentUser) return; // 로그인 안 됐으면 메시지 보내기 막기

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      content,
      timestamp: new Date(),
      isRead: false
    };

    setChatRooms((prev) =>
      prev.map((room) =>
        room.id === roomId
          ? { ...room, messages: [...room.messages, newMessage] }
          : room
      )
    );
  };

  const minimizeChat = (roomId: string) => {
    setChatRooms((prev) =>
      prev.map((room) =>
        room.id === roomId
          ? { ...room, isMinimized: !room.isMinimized }
          : room
      )
    );
  };

  const closeChat = (roomId: string) => {
    setChatRooms((prev) => prev.filter((room) => room.id !== roomId));
  };

  const setTyping = (roomId: string, isTyping: boolean) => {
    console.log(`Typing status in room ${roomId}: ${isTyping}`);
  };

  const markAsRead = (roomId: string) => {
    setChatRooms((prev) =>
      prev.map((room) =>
        room.id === roomId ? { ...room, unreadCount: 0 } : room
      )
    );
  };

  const toggleUserList = () => {
    setIsUserListOpen((prev) => !prev);
  };

  const reportUser = async (targetUser: User) => {
    if (!currentUser) {
      alert("로그인 후 이용해주세요.");
      return;
    }

    const reason = window.prompt(`"${targetUser.name}"님을 신고하는 이유를 입력하세요:`);

    if (!reason || reason.trim() === "") {
      alert("신고 사유를 입력해야 합니다.");
      return;
    }

    try {
      const reportData: {
        reason: string;
        targetUserId?: string;
        targetMentorId?: number;
      } = {
        reason
      };

      if (targetUser.id && targetUser.id !== "0") {
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
        currentUser: currentUser || undefined, // 로그인 안 된 상태는 undefined
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
