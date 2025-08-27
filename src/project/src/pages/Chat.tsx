
import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";
import { useAuth } from "@/contexts/AuthContext"; // useAuth 임포트 추가

interface Message {
  id: number;
  sender: "teacher" | "student";
  content: string;
  timestamp: string;
}

interface Teacher {
  name: string;
  subject: string;
  avatar: string;
}

const Chat = () => {
  const { teacherId } = useParams<{ teacherId: string }>();
  const navigate = useNavigate();
  const { user: currentUser, isLoggedIn } = useAuth(); // useAuth를 사용하여 currentUser와 isLoggedIn 가져오기
  const [chatId, setChatId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [teacher, setTeacher] = useState<Teacher>({
    name: "알 수 없음",
    subject: "미지정",
    avatar: "?",
  });
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. chatId 설정 (teacherId가 실제로는 chatId)
  useEffect(() => {
    if (teacherId) {
      const chatIdValue = parseInt(teacherId);
      setChatId(chatIdValue);
      console.log("✅ chatId 설정:", chatIdValue);
    }
  }, [teacherId]);

  // 2. 멘토 정보 조회 (chatId로 조회)
  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        console.log("📡 mentor info 요청:", `/api/mentoring/mentorByChatId?chatId=${chatId}`);
        const res = await fetch(`/api/mentoring/mentorByChatId?chatId=${chatId}`, {
          credentials: "include"
        });
        if (!res.ok) throw new Error("멘토 정보 로드 실패");

        const data = await res.json();
        console.log("✅ mentor response:", data);

        setTeacher({
          name: data.name,
          subject: data.subject,
          avatar: data.avatar || data.name?.charAt(0) || "?",
        });
      } catch (err) {
        console.error("❌ [오류] 멘토 정보 로드 실패:", err);
      }
    };

    if (chatId) fetchTeacher();
  }, [chatId]);

  // 3. 메시지 목록 조회 (MentoringChatroomController 사용) - 초기 로드
  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatId || !currentUser) return; // currentUser가 로드된 후에 실행
      try {
        console.log("📡 메시지 불러오기 - chatId:", chatId);
        const res = await fetch(`/api/mentoring/messages?roomId=${chatId}`, {
          credentials: "include",
        });

        if (!res.ok) {
          console.warn("⚠️ 메시지 API 응답 오류:", res.status);
          setMessages([]);
          return;
        }

        const data = await res.json();
        console.log("✅ 메시지 응답 (초기 로드):", data);

        // 현재 백엔드 API는 단일 MentoringChatroom 객체를 반환하므로, 마지막 메시지로 처리
        if (data && data.content) {
          const sentAtArray = data.sentAt; // 예: [2025, 8, 18, 15, 41, 11]
          const timestamp = sentAtArray ? new Date(
            sentAtArray[0],
            sentAtArray[1] - 1, // JavaScript Date 객체는 월이 0부터 시작
            sentAtArray[2],
            sentAtArray[3],
            sentAtArray[4],
            sentAtArray[5]
          ).toLocaleString("ko-KR") : new Date().toLocaleString("ko-KR");

          // 초기 메시지의 발신자 결정
          const isMyMessage = data.participant1Id === currentUser?.id; // participant1Id가 발신자라고 가정
          const senderType = isMyMessage
            ? (currentUser?.role === "MENTOR" ? "teacher" : "student")
            : (currentUser?.role === "MENTOR" ? "student" : "teacher");

          const formatted: Message[] = [{
            id: data.chat_id, // chat_id를 메시지 ID로 사용
            sender: senderType,
            content: data.content,
            timestamp: timestamp,
          }];
          setMessages(formatted);
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error("❌ [오류] 메시지 로드 실패:", err);
        setMessages([]);
      }
    };

    if (chatId && currentUser) fetchMessages(); // chatId와 currentUser가 모두 있을 때만 실행
  }, [chatId, currentUser]); // currentUser를 의존성 배열에 추가

  // WebSocket 연결 로직
  useEffect(() => {
    if (!chatId || !currentUser) return; // chatId와 currentUser가 모두 있을 때만 연결 시도

    const client = new Client({
      webSocketFactory: () => {
        console.log("🔌 [WebSocket] 연결 시도: https://192.168.56.1:8443/mentoring-ws");
        return new SockJS("https://192.168.56.1:8443/mentoring-ws");
      },
      debug: (str) => console.log("🔌 [WebSocket Debug]:", str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log("✅ [WebSocket 연결 성공]");
      setIsConnected(true);
      setStompClient(client);

      // 채팅방 구독
      client.subscribe(`/topic/mentoring/room/${chatId}`, handleReceivedMessage);
      client.subscribe(`/user/mentoring/queue/errors`, (error) => {
        console.error("❌ [WebSocket 에러 수신]:", error.body);
      });

      // 입장 메시지 전송
      client.publish({
        destination: `/app/mentoring/chat/join`, // 백엔드 @MessageMapping 경로와 일치
        body: JSON.stringify({
          roomId: chatId,
          userId: currentUser.id,
          username: currentUser.nickname,
        }),
      });
    };

    client.onStompError = (frame) => {
      console.error("❌ [STOMP 에러]:", frame);
      setIsConnected(false);
    };

    client.onDisconnect = () => {
      console.log("❌ [WebSocket 연결 해제]");
      setIsConnected(false);
    };

    client.activate();

    return () => {
      if (client.connected) {
        // 퇴장 메시지 전송
        client.publish({
          destination: `/app/mentoring/chat/leave`, // 백엔드 @MessageMapping 경로와 일치
          body: JSON.stringify({
            roomId: chatId,
            userId: currentUser.id,
            username: currentUser.nickname,
          }),
        });
        client.deactivate();
        console.log("🔌 [WebSocket] 연결 비활성화");
      }
    };
  }, [chatId, currentUser]); // currentUser를 의존성 배열에 추가

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!stompClient || !isConnected || !message.trim() || !chatId || !currentUser) return;

    const messagePayload = {
      roomId: chatId,
      senderId: currentUser.id, // 숫자 ID 전송
      content: message,
      senderName: currentUser.nickname, // 닉네임 전송
    };

    stompClient.publish({
      destination: `/app/mentoring/chat/send`, // 백엔드 @MessageMapping 경로와 일치
      body: JSON.stringify(messagePayload),
    });

    setMessage("");
  };

  const handleReceivedMessage = (payload: IMessage) => {
    const receivedMessage = JSON.parse(payload.body);
    console.log("✅ [WebSocket 메시지 수신]:", receivedMessage);

    // receivedMessage는 백엔드에서 보낸 메시지 객체 (chatId, roomId, senderId, senderName, content, sentAt, timestamp 등 포함)
    const sentAtArray = receivedMessage.sentAt; // 예: [2025, 8, 18, 15, 41, 11]
    const timestamp = sentAtArray ? new Date(
      sentAtArray[0],
      sentAtArray[1] - 1, // JavaScript Date 객체는 월이 0부터 시작
      sentAtArray[2],
      sentAtArray[3],
      sentAtArray[4],
      sentAtArray[5]
    ).toLocaleString("ko-KR") : new Date().toLocaleString("ko-KR"); // 폴백으로 현재 시간 사용

    const isMyMessage = receivedMessage.senderId === currentUser?.id;
    const senderType = isMyMessage
      ? (currentUser?.role === "MENTOR" ? "teacher" : "student") // 내 메시지인 경우
      : (currentUser?.role === "MENTOR" ? "student" : "teacher"); // 상대방 메시지인 경우

    const newMsg: Message = {
      id: receivedMessage.chatId || messages.length + 1, // 백엔드에서 받은 chatId를 고유 ID로 사용
      sender: senderType,
      content: receivedMessage.content,
      timestamp: timestamp,
    };
    setMessages((prev) => [...prev, newMsg]);
    scrollToBottom();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const getAvatarFallback = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="h-[80vh] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between border-b p-4">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Avatar className="h-10 w-10">
                <AvatarFallback>{getAvatarFallback(teacher.avatar)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">멘토 {teacher.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{teacher.subject}</p>
              </div>
            </div>
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? "🟢 실시간" : "🔴 연결 중..."}
            </Badge>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === (currentUser?.role === "MENTOR" ? "teacher" : "student") ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${msg.sender === (currentUser?.role === "MENTOR" ? "teacher" : "student")
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted text-foreground rounded-bl-none"}
                  `}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </CardContent>
          <div className="border-t p-4 flex items-center space-x-2">
            <Input
              placeholder="메시지를 입력하세요..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
              disabled={!isConnected}
            />
            <Button onClick={handleSendMessage} disabled={!isConnected || !message.trim()}>
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Chat;
