import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Bot } from "lucide-react";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}

const ChatMessage = ({ message, isUser, timestamp }: ChatMessageProps) => {
  return (
    <div className={`flex gap-3 p-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className={isUser ? "bg-primary text-primary-foreground" : "bg-muted"}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div
        className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
        style={{ maxWidth: "80%", minWidth: "200px" }}
      >
        <div
          className={`px-4 py-2 rounded-2xl break-words
            ${isUser
              ? "bg-blue-600 text-white shadow-md" // 유저 메시지: 파란 배경, 흰 글자, 그림자
              : "bg-gray-100 text-gray-800 border border-gray-300" // AI 메시지: 연한 회색 배경, 진한 글자, 테두리
            }
          `}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
        </div>
        {timestamp && (
          <span className="text-xs text-gray-400 mt-1 px-1 select-none">{timestamp}</span>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
