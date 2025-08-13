import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Check, X } from "lucide-react";
import { useChat, ChatRequest } from "@/contexts/ChatContext";

interface ChatRequestNotificationProps { request: ChatRequest; }

const ChatRequestNotification: React.FC<ChatRequestNotificationProps> = ({ request }) => {
  const { acceptChatRequest, rejectChatRequest } = useChat();

  const handleAccept = async () => {   
    await acceptChatRequest(request.id, request.from.id, request.to.id);
  };
 
  const handleReject = async () => {
    await rejectChatRequest(request.id, request.from.id, request.to.id);
  };

  return (
    <Card className="w-full shadow-elegant bg-card border border-border/50 animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="text-sm font-bold bg-gradient-to-br from-primary to-primary-glow text-white">
              {request.from.avatar}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <MessageCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">채팅 요청</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              <span className="font-medium text-foreground">{request.from.name}</span>님이 채팅을 요청했습니다
            </p>
            {request.from.subject && <Badge variant="outline" className="text-xs mb-3">{request.from.subject}</Badge>}

            <div className="flex gap-2">
              <Button size="sm" variant="default" onClick={handleAccept} className="flex-1 gap-1">
                <Check className="h-3 w-3" />수락
              </Button>
              <Button size="sm" variant="outline" onClick={handleReject} className="flex-1 gap-1">
                <X className="h-3 w-3" />거절
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ChatRequestNotifications: React.FC = () => {
  const { chatRequests, currentUser } = useChat();
  const pending = chatRequests.filter(
  r => r.status === "pending" && r.to.id === currentUser?.id // ← 추가
);
  return (
    <div
      aria-label="채팅 요청 알림 목록"
      className="fixed top-20 right-6 w-80 max-h-[min(70vh,32rem)] overflow-y-auto overscroll-contain space-y-3 p-1 z-50"
    >
      {pending.map((r) => (
        <ChatRequestNotification key={r.id} request={r} />
      ))}
    </div>
  );
};

export default ChatRequestNotifications;