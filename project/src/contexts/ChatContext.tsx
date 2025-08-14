import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
  useCallback,
} from "react";
import SockJS from 'sockjs-client/dist/sockjs';
import { Client as StompClient, IMessage } from "@stomp/stompjs";


const API_ORIGIN = import.meta.env.VITE_API_ORIGIN ?? "https://192.168.56.1:8080"; // ← 너희 백엔드 주소
const token = localStorage.getItem("access_token"); // 프로젝트에 맞춰 조정
const AUTH_HEADERS = token ? { Authorization: `Bearer ${token}` } : {};

const ROUTES = {
  API_BASE: `${API_ORIGIN}/api/rt-chat`,   // CHANGED
  WS_HTTP_URL: `${API_ORIGIN}/ws`,         // CHANGED
  APP_PREFIX: "/app",              // @MessageMapping 경로에 맞춰 사용
  TOPIC_PREFIX: "/topic",          // 브로드캐스트 구독
  USER_QUEUE_PREFIX: "/user/queue" // 1:1 큐
};

// ========================
// 타입
// ========================
export interface User {
  id: string; // member.userId
  name: string;
  avatar: string;
  isOnline: boolean;
  subject?: string;
  mentorId?: number;
  loginId?: string;  
}

export interface UIChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

export interface UIChatRoom {
  id: string; // chatroomId
  participants: User[];
  messages: UIChatMessage[];
  isMinimized: boolean;
  unreadCount: number;
  typingUsers: string[];
}

export interface ChatRequest {
  id: string; // 서버에서 발급한 requestId(문자열로 보관)
  from: User;
  to: User;
  timestamp: Date;
  status: "pending" | "accepted" | "rejected";
}

interface ChatContextType {
  currentUser?: User;
  users: User[];
  chatRooms: UIChatRoom[];
  chatRequests: ChatRequest[];
  isUserListOpen: boolean;

  // Actions
  sendChatRequest: (toUserId: string) => Promise<void>;
  acceptChatRequest: (requestId: string, fromUserId?: string, toUserId?: string) => Promise<void>;
  rejectChatRequest: (requestId: string, fromUserId?: string, toUserId?: string) => Promise<void>;
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
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within a ChatProvider");
  return ctx;
};

// ========================
// 유틸: 서버 → UI 매핑기
// ========================
function mapServerUser(u: any): User {
  const id = (u.userId ?? u.id ?? u.user_id ?? "0").toString();
  const name = u.name ?? u.nickname ?? `user-${id}`;
  const loginId = u.loginid ?? u.loginId ?? u.username ?? u.login_id ?? undefined; // ★ ADD
  return {
    id,
    name,
    avatar: name?.charAt(0) || "👤",
    isOnline: false,             // ★ 기본값 false로
    subject: u.major ?? undefined,
    mentorId: u.roles === "MENTOR" ? Number(id) : undefined,
    loginId,                     // ★ ADD
  };
}

function mapServerMessage(m: any): UIChatMessage {
  return {
    id: (m.messageId ?? m.id).toString(),
    senderId: (m.senderId ?? m.sender_id).toString(),
    content: m.content ?? "",
    timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
    isRead: Boolean(m.isRead ?? m.is_read ?? false),
  };
}

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);
  const [users, setUsers] = useState<User[]>([]);
  const [chatRooms, setChatRooms] = useState<UIChatRoom[]>([]);
  const [chatRequests, setChatRequests] = useState<ChatRequest[]>([]);
  const [isUserListOpen, setIsUserListOpen] = useState(false);

  const stompRef = useRef<StompClient | null>(null);
  const roomSubscriptions = useRef<Record<string, () => void>>({}); // roomId → unsubscribe

  // ------------------------
  // 현재 로그인 사용자 & 유저 목록 로드
  // ------------------------
  useEffect(() => {
    (async () => {
      try {
        // 현재 로그인 사용자
        const meRes = await fetch("/api/user", { credentials: "include" });
        const me = await meRes.json();
        if (me?.userId) setCurrentUser(mapServerUser(me));
        else setCurrentUser(undefined);
      } catch (e) {
        console.error("현재 사용자 조회 실패", e);
        setCurrentUser(undefined);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        // 다른 팀 API(이미 정상 동작)를 그대로 호출
        const res = await fetch("https://192.168.56.1:8080/users/all");
        const data = await res.json();
        const list: User[] = (Array.isArray(data) ? data : [])
          .filter((u: any) => typeof (u.userId ?? u.id) !== "undefined")
          .map(mapServerUser);
        setUsers(list);
      } catch (e) {
        console.error("유저 목록 조회 실패", e);
      }
    })();
  }, []);


// ✅ 여기에 추가 (유저 목록 로드 useEffect 바로 아래(온라인 목록 동기화))
useEffect(() => {
  console.log("랄라라"+API_ORIGIN);

  if (users.length === 0) return;
  (async () => {
    try {
      const res = await fetch(`${API_ORIGIN}/api/rt-chat/online`, {
        credentials: "include",
        headers: { ...AUTH_HEADERS },
      });
      if (!res.ok) return;
      const onlineLoginIds: string[] = await res.json(); // ["mentor01","userA", ...]
      setUsers(prev =>
        prev.map(u => ({
          ...u,
          isOnline: u.loginId ? onlineLoginIds.includes(u.loginId) : u.isOnline,
        })),
      );
    } catch (e) {
      console.warn("온라인 목록 동기화 실패", e);
    }
  })();
}, [users.length]);


// ------------------------
// STOMP 연결 & 구독 (사용자 로그인 이후)
// ------------------------
useEffect(() => {
  if (!currentUser?.id) return;

  const client = new StompClient({
    // SockJS factory를 사용: 자동 폴백/재연결 제공
    webSocketFactory: () => new SockJS(ROUTES.WS_HTTP_URL) as any,
    reconnectDelay: 3000,

    // ✅ JWT/세션 환경이면 CONNECT 헤더도 함께 보냄
    connectHeaders: { ...AUTH_HEADERS },

    // ✅ 여기(onConnect)가 "연결 성사 직후" 구독을 붙이는 자리
    onConnect: () => {
      // 1) 나에게 도착하는 채팅 요청 구독
      const sub1 = client.subscribe(
        `${ROUTES.USER_QUEUE_PREFIX}/requests`,
        (msg: IMessage) => {
          try {
            const payload = JSON.parse(msg.body);
            const req: ChatRequest = {
              id: (payload.requestId ?? payload.id).toString(),
              from: mapServerUser(payload.fromUser ?? payload.from),
              to: mapServerUser(payload.toUser ?? payload.to),
              timestamp: new Date(payload.createdAt ?? Date.now()),
              status: "pending",
            };
            setChatRequests((prev) => {
              if (prev.some((r) => r.id === req.id)) return prev; // 중복 방지
              return [req, ...prev];
            });
          } catch (e) {
            console.warn("요청 수신 파싱 실패", e);
          }
        }
      );

      // 2) 내가 보낸 요청이 수락됨 → 방 정보 수신하여 방 오픈
      const sub2 = client.subscribe(
        `${ROUTES.USER_QUEUE_PREFIX}/request-accepted`,
        (msg: IMessage) => {
          try {
            const payload = JSON.parse(msg.body);
            //const roomId = (payload?.chatroom?.chatroomId ?? payload?.chatroomId ?? payload?.roomId).toString();

            const roomIdRaw =
              payload?.roomId ??
              payload?.chatroom?.chatroomId ??
              payload?.chatroomId ??
              payload?.chatroom?.id;
            if (roomIdRaw == null) {
              console.error("request-accepted: roomId missing in payload", payload);
              return; // 안전 탈출
            }
            const roomId = String(roomIdRaw);
            const participants: User[] = Array.isArray(payload.participants)
              ? payload.participants.map(mapServerUser)
              : [];
            // 🔽 메시지가 오면 정렬, 아니면 빈 배열
            const messages: UIChatMessage[] = Array.isArray(payload.messages)
              ? payload.messages
                  .map(mapServerMessage)
                  .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
              : [];

            setChatRequests((prev) => prev.filter((r) => r.id !== String(payload.requestId)));
            setChatRooms((prev) => {
              if (prev.some((r) => r.id === roomId)) return prev;
              return [
                { id: roomId, participants, messages, isMinimized: false, unreadCount: 0, typingUsers: [] },
                ...prev,
              ];
            });

            subscribeRoomTopic(roomId, client);

            // 🔽 서버가 messages를 안 실어준 케이스(요청자 등): 즉시 히스토리 로드
            if (messages.length === 0) {
              loadRoomHistory(roomId);
            }

          } catch (e) {
            console.warn("수락 알림 파싱 실패", e);
          }
        }
      );

      // 3) ✅ Presence(온라인/오프라인) 실시간 반영
      const sub3 = client.subscribe(
        `${ROUTES.TOPIC_PREFIX}/presence`,
        (frame: IMessage) => {
          try {
            const p = JSON.parse(frame.body) as { status: "ONLINE" | "OFFLINE"; loginId: string };
            setUsers((prev) =>
              prev.map((u) => (u.loginId === p.loginId ? { ...u, isOnline: p.status === "ONLINE" } : u))
            );
          } catch {/* ignore */}
        }
      );

      // 언서브 핸들러 보관
      roomSubscriptions.current["__requests__"] = () => sub1.unsubscribe();
      roomSubscriptions.current["__accepted__"] = () => sub2.unsubscribe();
      roomSubscriptions.current["__presence__"] = () => sub3.unsubscribe();
    },

    onStompError: (f) => console.error("STOMP error", f.headers["message"], f.body),
    onWebSocketClose: () => console.warn("🔌 WebSocket closed"),
  });

  client.activate();
  stompRef.current = client;

  return () => {
    // 모든 구독 해제
    Object.values(roomSubscriptions.current).forEach((unsub) => unsub?.());
    roomSubscriptions.current = {};
    client.deactivate();
    stompRef.current = null;
  };
}, [currentUser?.id]);


// 방 토픽 구독 & 메시지 수신 시 상태 반영
const subscribeRoomTopic = (roomId: string, client?: StompClient) => {
  const c = client ?? stompRef.current;
  if (!c) return;
  if (roomSubscriptions.current[roomId]) return; // 이미 구독 중

  const sub = c.subscribe(
    `${ROUTES.TOPIC_PREFIX}/rooms/${roomId}`,
    (msg: IMessage) => {
      try {
        const payload = JSON.parse(msg.body);
        const m = mapServerMessage(payload);
        setChatRooms((prev) => {
          const next = [...prev];
          const idx = next.findIndex((r) => r.id === roomId);
          if (idx < 0) return prev;

          const room = next[idx];
          // ✅ 같은 ID면 추가하지 않음
          if (room.messages.some((x) => String(x.id) === String(m.id))) return prev;

          next[idx] = { ...room, messages: [...room.messages, m] };
          return next;
        });
      } catch (e) {
        console.warn("메시지 수신 파싱 실패", e);
      }
    }
  );

  roomSubscriptions.current[roomId] = () => sub.unsubscribe();
};

async function loadRoomHistory(roomId: string) {
  try {
    const res = await fetch(`${ROUTES.API_BASE}/rooms/${roomId}/messages?size=50`, {
      credentials: "include",
      headers: { ...AUTH_HEADERS },
    });
    if (!res.ok) return;

    const raw = await res.json();
    const msgs = (Array.isArray(raw) ? raw : [])
      .map(mapServerMessage)
      // 🔽 오래→최신(오름차순)으로 맞춰서 세팅
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    setChatRooms(prev => {
      const next = [...prev];
      const idx = next.findIndex(r => r.id === roomId);
      if (idx < 0) return prev;
      next[idx] = { ...next[idx], messages: msgs };
      return next;
    });
  } catch (e) {
    console.warn("loadRoomHistory failed", e);
  }
}

  // ------------------------
  // Actions
  // ------------------------
// CHANGED: 요청 생성 — 반드시 백엔드(8080)로, JWT 헤더 포함
const sendChatRequest = async (toUserId: string) => {
  if (!currentUser?.id) {
    alert("로그인 후 이용해주세요.");
    return;
  }
  const res = await fetch(`${ROUTES.API_BASE}/requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...AUTH_HEADERS }, // CHANGED
    credentials: "include",
    body: JSON.stringify({ toUserId: Number(toUserId) }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("요청 생성 실패", res.status, text);
    alert("채팅 요청 전송에 실패했습니다.");
    return;
  }

  // 낙관적 카드 추가는 유지하되, 렌더 쪽에서 "나에게 온 요청만" 보이도록 이미 제한하셨으니 OK
  const created = await res.json();
  const toUser = users.find((u) => u.id === toUserId);
  if (toUser) {
    setChatRequests((prev) => [
      {
        id: (created.requestId ?? created.id ?? Date.now()).toString(),
        from: currentUser, // 요청자(나)
        to: toUser,        // 수신자
        timestamp: new Date(),
        status: "pending",
      },
      ...prev,
    ]);
  }
};

// CHANGED: 수락/거절도 JWT 헤더 포함 + 동일 호스트
const acceptChatRequest = async (requestId: string, fromUserId?: string, toUserId?: string) => {
  // 💡 누락되면 현재 보관 중인 요청에서 보완
  if (!fromUserId || !toUserId) {
    const req = chatRequests.find((r) => r.id === requestId);
    if (req) {
      fromUserId = fromUserId ?? req.from.id;
      toUserId   = toUserId   ?? req.to.id;
    }
  }
  if (!fromUserId || !toUserId) {
    console.error("acceptChatRequest: from/to id missing");
    alert("수락 정보가 부족합니다. 다시 시도해주세요.");
    return;
  }

  const res = await fetch(`${ROUTES.API_BASE}/requests/${requestId}/accept`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...AUTH_HEADERS },
    credentials: "include",
    body: JSON.stringify({ requestId, fromUserId: Number(fromUserId), toUserId: Number(toUserId) }),
  });

    if (!res.ok) {
      const t = await res.text();
      console.error("수락 실패", res.status, t);
      alert("채팅 요청 수락 중 오류가 발생했습니다.");
      return;
    }

    const payload = await res.json();
    //const roomId = (payload?.chatroom?.chatroomId ?? payload?.chatroomId ?? payload?.roomId).toString();

    const roomIdRaw =
      payload?.roomId ??
      payload?.chatroom?.chatroomId ??
      payload?.chatroomId ??
      payload?.chatroom?.id;
    if (roomIdRaw == null) {
      console.error("acceptChatRequest: roomId missing in response", payload);
      alert("수락은 되었지만 방 정보를 받지 못했습니다. 새로고침 후 다시 시도해주세요.");
      return;
    }
    const roomId = String(roomIdRaw);

    const participants: User[] = (payload.participants ?? [])
      .map(mapServerUser)
      .filter(Boolean);

    setChatRequests((prev) => prev.filter((r) => r.id !== requestId));
    setChatRooms((prev) => {
      if (prev.some((r) => r.id === roomId)) return prev;
      return [
        {
          id: roomId,
          participants,
          messages: [],
          isMinimized: false,
          unreadCount: 0,
          typingUsers: [],
        },
        ...prev,
      ];
    });

    // 과거 메시지 불러오기
    try {
      const his = await fetch(
        `${ROUTES.API_BASE}/rooms/${roomId}/messages?size=30`,
        { credentials: "include" }
      );
      if (his.ok) {
        const arr = await his.json();
        const msgs = (Array.isArray(arr) ? arr : [])
          .map(mapServerMessage)
          // 🔽 오래→최신(오름차순)
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          
        setChatRooms((prev) =>
          prev.map((r) => (r.id === roomId ? { ...r, messages: msgs } : r))
        );
      }
    } catch (e) {
      console.warn("히스토리 로드 실패", e);
    }

    subscribeRoomTopic(roomId);
  };

const rejectChatRequest = async (requestId: string, fromUserId?: string, toUserId?: string) => {
  // 누락되면 보관 중인 요청에서 보완
  if (!fromUserId || !toUserId) {
    const req = chatRequests.find((r) => r.id === requestId);
    if (req) {
      fromUserId = fromUserId ?? req.from.id;
      toUserId   = toUserId   ?? req.to.id;
    }
  }
  if (!fromUserId || !toUserId) {
    console.error("rejectChatRequest: from/to id missing");
    alert("거절 정보가 부족합니다. 다시 시도해주세요.");
    return;
  }

  const res = await fetch(`${ROUTES.API_BASE}/requests/${requestId}/reject`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", ...AUTH_HEADERS }, // JWT 사용 시
    body: JSON.stringify({ requestId, fromUserId: Number(fromUserId), toUserId: Number(toUserId) }),
  });

  if (!res.ok) {
    const t = await res.text();
    console.error("거절 실패", res.status, t);
    alert("채팅 요청 거절 중 오류가 발생했습니다.");
    return;
  }

  setChatRequests((prev) => prev.filter((r) => r.id !== requestId));
};


  const sendMessage = (roomId: string, content: string) => {
    if (!content?.trim()) return;
    if (!currentUser?.id) return;

    // 실시간 전송(STOMP)
    const client = stompRef.current;
    if (client && client.connected) {
      client.publish({
        destination: `${ROUTES.APP_PREFIX}/rooms/${roomId}/send`,
        body: JSON.stringify({ senderId: Number(currentUser.id), content }),
      });
    }
  };

  const minimizeChat = (roomId: string) => {
    setChatRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, isMinimized: !r.isMinimized } : r))
    );
  };

  const closeChat = (roomId: string) => {
    // 토픽 구독 해제
    const unsub = roomSubscriptions.current[roomId];
    unsub?.();
    delete roomSubscriptions.current[roomId];

    setChatRooms((prev) => prev.filter((r) => r.id !== roomId));
  };

  const setTyping = (roomId: string, isTyping: boolean) => {
    // 서버에 타이핑 신호를 보낼 계획이라면 여기서 publish
    console.log(`typing(${roomId}):`, isTyping);
  };

// ⬇️ ChatContext 내부
const markAsRead = useCallback((roomId: string) => {
  setChatRooms(prev => {
    const idx = prev.findIndex(r => r.id === roomId);
    if (idx < 0) return prev;

    const room = prev[idx];
    // ✅ 이미 0이면 아무것도 안 바꾸고 그대로 반환 (렌더 유발 X)
    if (!room.unreadCount || room.unreadCount === 0) return prev;

    const next = [...prev];
    next[idx] = { ...room, unreadCount: 0 };
    return next;
  });
  // 필요 시 서버에 읽음 동기화 fetch는 하되, setState는 위 조건 충족 때만
}, []); // ✅ 레퍼런스 고정






  const toggleUserList = () => setIsUserListOpen((v) => !v);

  const reportUser = async (targetUser: User) => {
    if (!currentUser) return alert("로그인 후 이용해주세요.");
    const reason = window.prompt(`"${targetUser.name}"님을 신고하는 이유를 입력하세요:`);
    if (!reason?.trim()) return alert("신고 사유를 입력해야 합니다.");

    try {
      const res = await fetch("/api/admin/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          reason: reason.trim(),
          targetUserId: Number(targetUser.id),
          targetMentorId: targetUser.mentorId,
        }),
      });
      if (res.ok) alert("신고가 정상적으로 접수되었습니다.");
      else alert(`신고 실패: ${res.status}`);
    } catch (e) {
      console.error("신고 실패", e);
      alert("신고 처리 중 오류가 발생했습니다.");
    }
  };

  const value: ChatContextType = useMemo(
    () => ({
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
      reportUser,
    }),
    [currentUser, users, chatRooms, chatRequests, isUserListOpen]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};