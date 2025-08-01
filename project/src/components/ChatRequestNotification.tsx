// src/components/ChatRequestNotifications.tsx

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Check, X } from "lucide-react";
import { useChat, ChatRequest } from "@/contexts/ChatContext";
import OnlineUserListWithReport from "@/components/OnlineUserListWithReport"; // ✅ 추가

interface ChatRequestNotificationProps {
  request: ChatRequest;
}

const ChatRequestNotification: React.FC<ChatRequestNotificationProps> = ({ request }) => {
  const { acceptChatRequest, rejectChatRequest } = useChat();

  const handleAccept = () => {
    acceptChatRequest(request.id);
  };

  const handleReject = () => {
    rejectChatRequest(request.id);
  };

  return (
    <Card className="fixed top-20 right-6 w-80 shadow-elegant bg-card border border-border/50 animate-fade-in z-50">
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
            
            {request.from.subject && (
              <Badge variant="outline" className="text-xs mb-3">
                {request.from.subject}
              </Badge>
            )}
            
            <div className="flex gap-2">
              <Button size="sm" variant="default" onClick={handleAccept} className="flex-1 gap-1">
                <Check className="h-3 w-3" />
                수락
              </Button>
              <Button size="sm" variant="outline" onClick={handleReject} className="flex-1 gap-1">
                <X className="h-3 w-3" />
                거절
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ChatRequestNotifications: React.FC = () => {
  const { chatRequests } = useChat();
  const pendingRequests = chatRequests.filter(request => request.status === 'pending');

  return (
    <>
      {pendingRequests.map((request, index) => (
        <div key={request.id} style={{ top: `${5 + index * 6}rem` }} className="absolute">
          <ChatRequestNotification request={request} />
        </div>
      ))}

      {/* ✅ 온라인 유저 목록 + 신고 버튼 UI 추가 */}
      <div className="fixed bottom-6 right-6 z-40">
       
      </div>
    </>
  );
};

export default ChatRequestNotifications;
