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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "teacher",
      content: "안녕하세요! 매칭해주셔서 감사합니다. 어떤 것을 도와드릴까요?",
      timestamp: "오후 2:30"
    },
    {
      id: 2,
      sender: "student", 
      content: "안녕하세요! 조선시대 정치제도에 대해서 질문이 있어요.",
      timestamp: "오후 2:31"
    },
    {
      id: 3,
      sender: "teacher",
      content: "좋습니다! 조선시대 정치제도는 정말 중요한 주제네요. 구체적으로 어떤 부분이 궁금하신가요?",
      timestamp: "오후 2:32"
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const teacher = teacherId ? teacherData[teacherId as keyof typeof teacherData] : null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!teacher) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
        <Navigation />
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground">멘토를 찾을 수 없습니다</h1>
          <Button onClick={() => navigate("/matching")} className="mt-4">
            매칭 페이지로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        sender: "student",
        content: message,
        timestamp: new Date().toLocaleTimeString('ko-KR', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        })
      };
      setMessages([...messages, newMessage]);
      setMessage("");

      setTimeout(() => {
        const responses = [
          "네, 좋은 질문이네요! 자세히 설명해드리겠습니다.",
          "그 부분은 많은 학생들이 어려워하는 부분입니다. 차근차근 설명해드릴게요.",
          "맞습니다! 이해가 빠르시네요. 추가로 설명드리면...",
          "정확히 파악하셨습니다. 관련해서 더 설명드리면..."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const teacherMessage: Message = {
          id: messages.length + 2,
          sender: "teacher",
          content: randomResponse,
          timestamp: new Date().toLocaleTimeString('ko-KR', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          })
        };
        setMessages(prev => [...prev, teacherMessage]);
      }, 1000 + Math.random() * 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-primary to-primary-glow text-white">
                        {teacher.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{teacher.name} 멘토</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{teacher.subject}</Badge>
                      <span className="text-sm text-green-600 font-medium">온라인</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm"><Phone className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm"><Video className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
              </div>
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

        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            💡 질문이 많으시면 언제든지 편하게 물어보세요!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
