import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";

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
  const [chatId, setChatId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [teacher, setTeacher] = useState<Teacher>({
    name: "알 수 없음",
    subject: "미지정",
    avatar: "?",
  });

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

  // 3. 메시지 목록 조회 (MentoringChatroomController 사용)
  useEffect(() => {
    const fetchMessages = async () => {
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
        console.log("✅ 메시지 응답:", data);

        // MentoringChatroom에서 content가 있으면 메시지로 표시
        if (data.content) {
          const formatted: Message[] = [{
            id: 1,
            sender: "student", // 기본적으로 학생이 보낸 것으로 가정
            content: data.content,
            timestamp: data.sentAt ? new Date(data.sentAt).toLocaleTimeString("ko-KR", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }) : new Date().toLocaleTimeString("ko-KR", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }),
          }];

          console.log("✅ 포맷된 메시지 개수:", formatted.length);
          setMessages(formatted);
        } else {
          console.log("📭 저장된 메시지 없음");
          setMessages([]);
        }
      } catch (err) {
        console.error("❌ [오류] 메시지 불러오기 실패:", err);
        setMessages([]);
      }
    };

    if (chatId !== null) fetchMessages();
  }, [chatId]);

  // 스크롤 맨 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4. 메시지 전송 (MentoringChatroomController 사용)
  const handleSendMessage = async () => {
    if (!message.trim() || chatId === null) return;

    const timestamp = new Date().toISOString();
    console.log("�� 보내기:", message);

    const newMessage: Message = {
      id: messages.length + 1,
      sender: "student",
      content: message,
      timestamp: new Date().toLocaleTimeString("ko-KR", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");

    try {
      // MentoringChatroomController의 /api/mentoring/messages 사용
      const response = await fetch("/api/mentoring/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          roomId: chatId,
          senderId: "student",
          content: message,
          timestamp,
        }),
      });
      if (!response.ok) throw new Error("메시지 저장 실패");
      console.log("✅ 메시지 저장 완료");
    } catch (err) {
      console.error("❌ [오류] 메시지 저장 실패:", err);
    }

    // 💬 테스트용 가상 답변
    setTimeout(() => {
      const responses = [
        "좋은 질문입니다. 자세히 설명드릴게요.",
        "그 부분은 많은 학생이 헷갈려하죠. 정리해드릴게요.",
        "잘 이해하셨습니다. 추가로 말씀드리면...",
        "정확히 파악하셨어요! 이어서 설명드릴게요.",
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      const teacherMessage: Message = {
        id: messages.length + 2,
        sender: "teacher",
        content: randomResponse,
        timestamp: new Date().toLocaleTimeString("ko-KR", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      };
      setMessages((prev) => [...prev, teacherMessage]);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100">
      <Navigation />
      <div className="max-w-4xl mx-auto px-6 py-6">
        <Card className="mb-4">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Avatar className="h-12 w-12">
                <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-primary to-primary-glow text-white">
                  {teacher.avatar}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-lg">{teacher.name} 멘토</CardTitle>
              <Badge variant="outline" className="text-xs">{teacher.subject}</Badge>
            </div>
          </CardHeader>
        </Card>

        <Card className="h-[500px] flex flex-col">
          <CardContent className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "student" ? "justify-end" : "justify-start"}`}>
                  <div className="flex items-end gap-2 max-w-[70%]">
                    {msg.sender === "teacher" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-sm bg-gradient-to-br from-primary to-primary-glow text-white">
                          {teacher.avatar}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="space-y-1">
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          msg.sender === "student"
                            ? "bg-primary text-primary-foreground ml-auto"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                      </div>
                      <p
                        className={`text-xs text-muted-foreground ${
                          msg.sender === "student" ? "text-right" : "text-left"
                        }`}
                      >
                        {msg.timestamp}
                      </p>
                    </div>
                    {msg.sender === "student" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-sm bg-secondary">나</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="메시지를 입력하세요..."
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                size="sm"
                className="px-4"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Chat;