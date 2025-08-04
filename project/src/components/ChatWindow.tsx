import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Minimize2, X, Send, Phone, Video, GripVertical } from "lucide-react";
import { useChat, ChatRoom } from "@/contexts/ChatContext";

interface ChatWindowProps {
  room: ChatRoom;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ room }) => {
  const { sendMessage, minimizeChat, closeChat, markAsRead } = useChat();
  const [message, setMessage] = useState('');
  const [position, setPosition] = useState({ x: window.innerWidth - 400, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  const otherParticipant = room.participants.find(p => p.id !== 'current-user') || room.participants[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [room.messages]);

  // ✅ 무한루프 방지용 조건 추가
  useEffect(() => {
    if (!room.isMinimized && room.unreadCount > 0) {
      markAsRead(room.id);
    }
  }, [room.isMinimized, room.unreadCount, room.id]);

  const handleSendMessage = async () => {
    if (message.trim()) {
      sendMessage(room.id, message);
      try {
        await fetch("/api/chat/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomId: room.id,
            senderId: "current-user",
            content: message.trim()
          })
        });
      } catch (err) {
        console.error("채팅 로그 전송 실패", err);
      }
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - 350, e.clientX - dragOffset.x)),
        y: Math.max(0, Math.min(window.innerHeight - 400, e.clientY - dragOffset.y))
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  if (room.isMinimized) {
    return (
      <div ref={chatWindowRef} className="fixed bottom-4 w-60 z-50 animate-fade-in" style={{ left: `${position.x}px` }}>
        <Card className="shadow-elegant cursor-pointer hover:shadow-glow transition-shadow" onClick={() => minimizeChat(room.id)}>
          <CardHeader className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-primary to-primary-glow text-white">
                      {otherParticipant.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">{otherParticipant.name}</h4>
                  {room.unreadCount > 0 && (
                    <Badge variant="destructive" className="text-xs h-4 px-1">{room.unreadCount}</Badge>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); closeChat(room.id); }} className="h-6 w-6 p-0">
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div ref={chatWindowRef} className="fixed w-80 h-96 z-50 animate-scale-in" style={{ left: `${position.x}px`, top: `${position.y}px` }}>
      <Card className="h-full flex flex-col shadow-elegant bg-card border border-border/50">
        <CardHeader className="p-3 cursor-move select-none bg-gradient-to-r from-primary/5 to-primary-glow/5" onMouseDown={handleMouseDown}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-primary to-primary-glow text-white">
                    {otherParticipant.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <div>
                <h4 className="text-sm font-medium">{otherParticipant.name}</h4>
                <span className="text-xs text-green-600">온라인</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0"><Phone className="h-3 w-3" /></Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0"><Video className="h-3 w-3" /></Button>
              <Button variant="ghost" size="sm" onClick={() => minimizeChat(room.id)} className="h-6 w-6 p-0"><Minimize2 className="h-3 w-3" /></Button>
              <Button variant="ghost" size="sm" onClick={() => closeChat(room.id)} className="h-6 w-6 p-0"><X className="h-3 w-3" /></Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-3 overflow-y-auto bg-background/50">
          <div className="space-y-2">
            {room.messages.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-xs">대화를 시작해보세요! 👋</p>
              </div>
            ) : (
              room.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.senderId === 'current-user' ? 'justify-end' : 'justify-start'}`}>
                  <div className="flex items-end gap-1 max-w-[70%]">
                    {msg.senderId !== 'current-user' && (
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-primary-glow text-white">
                          {otherParticipant.avatar}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="space-y-1">
                      <div className={`px-2 py-1 rounded-lg text-xs ${
                        msg.senderId === 'current-user'
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-muted text-foreground'
                      }`}>
                        <p>{msg.content}</p>
                      </div>
                      <p className={`text-xs text-muted-foreground ${
                        msg.senderId === 'current-user' ? 'text-right' : 'text-left'
                      }`}>
                        {msg.timestamp.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true })}
                      </p>
                    </div>
                    {msg.senderId === 'current-user' && (
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-secondary">나</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>

        <div className="p-2 border-t">
          <div className="flex gap-1">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지 입력..."
              className="text-xs h-8"
            />
            <Button onClick={handleSendMessage} disabled={!message.trim()} size="sm" className="h-8 px-2">
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatWindow;
