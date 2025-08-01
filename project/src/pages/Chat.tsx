// ✅ Chat.tsx 실시간 로그 전송 기능 반영한 최종 버전

import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, ArrowLeft, Phone, Video, MoreVertical } from "lucide-react";
import Navigation from "@/components/Navigation";

const teacherData = {
  teacher1: { name: "김역사", subject: "한국사", avatar: "김" },
  teacher2: { name: "이선생", subject: "한국사", avatar: "이" },
  teacher3: { name: "박교수", subject: "한국사", avatar: "박" },
  teacher4: { name: "최국어", subject: "국어", avatar: "최" },
  teacher5: { name: "정선생", subject: "국어", avatar: "정" },
  teacher6: { name: "Smith", subject: "영어", avatar: "S" },
  teacher7: { name: "김영어", subject: "영어", avatar: "김" },
  teacher8: { name: "Johnson", subject: "영어", avatar: "J" },
};

interface Message {
  id: number;
  sender: "teacher" | "student";
  content: string;
  timestamp: string;
}

const Chat = () => {
  const { teacherId } = useParams<{ teacherId: string }>();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const teacher = teacherId ? teacherData[teacherId as keyof typeof teacherData] : null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const timestamp = new Date().toISOString();

    const newMessage: Message = {
      id: messages.length + 1,
      sender: "student",
      content: message,
      timestamp: new Date().toLocaleTimeString("ko-KR", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    };

    setMessages([...messages, newMessage]);
    setMessage("");

    try {
      await fetch("/api/chat/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "chat_message",
          roomId: teacherId,
          senderId: "student",
          content: message,
          timestamp: timestamp
        })
      });
    } catch (err) {
      console.error("로그 전송 실패", err);
    }

    setTimeout(() => {
      const responses = [
        "좋은 질문입니다. 자세히 설명드릴게요.",
        "그 부분은 많은 학생이 헷갈려하죠. 정리해드릴게요.",
        "잘 이해하셨습니다. 추가로 말씀드리면...",
        "정확히 파악하셨어요! 이어서 설명드릴게요."
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
        })
      };
      setMessages(prev => [...prev, teacherMessage]);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!teacher) return <div>멘토 정보가 없습니다</div>;

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
                <div key={msg.id} className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}>
                  <div className="flex items-end gap-2 max-w-[70%]">
                    {msg.sender === 'teacher' && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-sm bg-gradient-to-br from-primary to-primary-glow text-white">
                          {teacher.avatar}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="space-y-1">
                      <div className={`px-4 py-2 rounded-2xl ${msg.sender === 'student' ? 'bg-primary text-primary-foreground ml-auto' : 'bg-muted text-foreground'}`}>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                      <p className={`text-xs text-muted-foreground ${msg.sender === 'student' ? 'text-right' : 'text-left'}`}>
                        {msg.timestamp}
                      </p>
                    </div>
                    {msg.sender === 'student' && (
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
