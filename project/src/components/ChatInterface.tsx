import { useState } from "react";
import ChatSidebar from "./ChatSidebar";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { BookOpen, Calculator, FileText, Lightbulb } from "lucide-react";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (messageText: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date().toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // 시뮬레이션된 AI 응답
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `안녕하세요! "${messageText}"에 대해 도움을 드리겠습니다. 어떤 구체적인 질문이 있으신가요?`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit'
        }),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const quickActions = [
    { icon: BookOpen, label: "한국사 학습", color: "bg-blue-50 hover:bg-blue-100 text-blue-700" },
    { icon: Calculator, label: "수학 문제 해결", color: "bg-green-50 hover:bg-green-100 text-green-700" },
    { icon: FileText, label: "국어 문법 정리", color: "bg-purple-50 hover:bg-purple-100 text-purple-700" },
    { icon: Lightbulb, label: "과학 개념 설명", color: "bg-orange-50 hover:bg-orange-100 text-orange-700" },
  ];

  return (
    <div className="flex h-screen bg-background">
      <ChatSidebar />

      {/* 메인 컬럼: overflow-hidden 으로 내부 스크롤만 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {messages.length === 0 ? (
            // 중앙 세로 정렬을 풀고 여백만 적절히 배치해 히어로를 약간 위로
            <div className="flex-1 flex flex-col items-center p-8 pt-12">
              <div className="text-center max-w-2xl">
                <h1 className="text-4xl font-bold text-foreground mb-4">
                  무엇을 도와드릴까요?
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  한국사, 국어, 수학, 과학 등 모든 학습 질문에 답해드립니다.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {quickActions.map((action, index) => (
                    <Card
                      key={index}
                      className={`p-4 cursor-pointer transition-all duration-200 ${action.color} border-transparent hover:shadow-soft`}
                      onClick={() => handleSendMessage(`${action.label}에 대해 알려주세요`)}
                    >
                      <div className="flex items-center gap-3">
                        <action.icon className="h-6 w-6" />
                        <span className="font-medium">{action.label}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <ScrollArea className="flex-1">
              <div className="max-w-4xl mx-auto">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message.text}
                    isUser={message.isUser}
                    timestamp={message.timestamp}
                  />
                ))}
                {isLoading && (
                  <div className="flex gap-3 p-4">
                    <div className="bg-muted rounded-full h-8 w-8 flex items-center justify-center">
                      <div className="w-4 h-4 bg-muted-foreground rounded-full animate-pulse" />
                    </div>
                    <div className="bg-chat-bubble-assistant border border-border rounded-2xl px-4 py-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Input Area: sticky + bottom-8 로 살짝 위로 띄움 */}
        <div
          className="
            border-t border-border sticky bottom-8
            bg-background/95 backdrop-blur
            supports-[backdrop-filter]:bg-background/70
            px-4 pb-[env(safe-area-inset-bottom)]
          "
        >
          <div className="max-w-4xl mx-auto">
            <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
