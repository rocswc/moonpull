import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, X, Bot, Copy, Check } from "lucide-react";

interface Message {
  id: number;
  sender: "bot" | "user";
  content: string;
  timestamp: string;
}

interface MyChatBotProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const MyChatBot = ({ isOpen = true, onClose = () => {} }: MyChatBotProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "bot",
      content: "안녕하세요! 문풀 챗봇입니다. 무엇을 도와드릴까요?",
      timestamp: new Date().toLocaleTimeString("ko-KR", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateBotResponse = (userMessage: string): string => {
    const responses = [
      "좋은 질문이네요! 더 자세히 설명해드릴게요.",
      "네, 이해했습니다. 도움이 되는 정보를 제공해드릴게요.",
      "그 부분에 대해 설명드리겠습니다.",
      "맞습니다! 추가로 알려드릴 내용이 있어요.",
      "흥미로운 질문입니다. 차근차근 답변해드릴게요.",
      "문풀에서 제공하는 서비스에 대해 궁금한 것이 더 있으시면 언제든 물어보세요!",
      "학습에 도움이 되는 팁을 알려드릴까요?",
      "멘토·멘티 매칭 서비스나 퀴즈 기능을 활용해보시는 것을 추천드려요!",
    ];
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        sender: "user",
        content: message,
        timestamp: new Date().toLocaleTimeString("ko-KR", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      };
      setMessages((prev) => [...prev, newMessage]);
      setMessage("");
      setIsTyping(true);

      setTimeout(() => {
        const botResponse: Message = {
          id: messages.length + 2,
          sender: "bot",
          content: generateBotResponse(message),
          timestamp: new Date().toLocaleTimeString("ko-KR", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
        };
        setMessages((prev) => [...prev, botResponse]);
        setIsTyping(false);
      }, 1000 + Math.random() * 2000);
    }
  };

  const handleCopyMessage = async (content: string, messageId: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 pointer-events-none">
      <Card className="w-[400px] h-[600px] flex flex-col shadow-xl border pointer-events-auto animate-in slide-in-from-bottom-4">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-sm font-medium">나만의 챗봇</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-3 overflow-y-auto">
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className="flex items-end gap-2 max-w-[85%]">
                  {msg.sender === "bot" && (
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        <Bot className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="space-y-1">
                    <div
                      className={`relative group px-3 py-2 rounded-lg text-sm ${
                        msg.sender === "user"
                          ? "bg-primary text-primary-foreground ml-auto"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleCopyMessage(msg.content, msg.id)}
                      >
                        {copiedMessageId === msg.id ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    <p
                      className={`text-xs text-muted-foreground ${
                        msg.sender === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      {msg.timestamp}
                    </p>
                  </div>
                  {msg.sender === "user" && (
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-secondary text-xs">나</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-end gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      <Bot className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted px-3 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </CardContent>

        <div className="border-t p-3">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              className="flex-1 text-sm"
              disabled={isTyping}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || isTyping}
              size="sm"
              className="px-3"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MyChatBot;
