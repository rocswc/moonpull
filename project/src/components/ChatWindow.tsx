import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Minimize2, X, Send, Phone, Video, GripVertical } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";

/** 🔒 Keep existing chat-log API (do not remove) **/
const CHAT_LOG_URL = '/api/chat/log'; // ⬇️ 기존 경로가 다르면 여기만 바꾸세요. 다른 로직은 손대지 않습니다.
function persistChatLog({roomId, senderId, receiverId, content, timestamp}: {roomId:string; senderId:string; receiverId:string; content:string; timestamp:string}) {
  try {
    const body = JSON.stringify({ roomId, senderId, receiverId, content, timestamp });
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon(CHAT_LOG_URL, blob);
    } else {
      fetch(CHAT_LOG_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body,
      }).catch(()=>{});
    }
  } catch (_) {}
}

interface ChatWindowProps {
  room: {
    id: string;
    participants: Array<{ id: string; name: string; avatar: string }>;
    messages: Array<{ id: string | number; senderId: string | number; content: string; timestamp: any }>;
    isMinimized: boolean;
    unreadCount: number;
  };
}

const ChatWindow: React.FC<ChatWindowProps> = ({ room }) => {
  const { sendMessage, minimizeChat, closeChat, markAsRead, currentUser } = useChat();

  const [message, setMessage] = useState('');
  const [position, setPosition] = useState({ x: typeof window !== 'undefined' ? Math.max(0, window.innerWidth - 400) : 0, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  const otherParticipant = useMemo(() => {
    const meId = currentUser?.id?.toString();
    return room.participants.find(p => p.id.toString() !== meId) || room.participants[0];
  }, [room.participants, currentUser?.id]);

  // 스크롤 항상 하단으로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [room.messages.length]);

  // 창이 열려 있고 새 메시지가 오면 읽음 처리
  useEffect(() => {
    if (!currentUser?.id) return;
    if (room.isMinimized) return;
    if (room.messages.length === 0) return;
    const last = room.messages[room.messages.length - 1];
    const lastFromOther = String(last.senderId) !== String(currentUser.id);
    if (lastFromOther) markAsRead(room.id);
  }, [room.messages.length, room.isMinimized, currentUser?.id, room.id, markAsRead]);

  // 최소화 풀리면 읽음 처리(기존 로직 유지)
  useEffect(() => {
    if (!room.isMinimized && room.unreadCount > 0) {
      markAsRead(room.id);
    }
  }, [room.isMinimized, room.unreadCount, room.id, markAsRead]);

  const handleSendMessage = () => {
    const text = message.trim();
    if (!text) return;
    sendMessage(room.id, text); // ✅ STOMP 전송(백엔드에 맞춤)

    // 🧾 채팅 로그(기존 로깅 유지)
    const receiverId = otherParticipant?.id?.toString() ?? '';
    persistChatLog({
      roomId: room.id.toString(),
      senderId: String(currentUser?.id ?? ''),
      receiverId,
      content: text,
      timestamp: new Date().toISOString(),
    });

    setMessage('');
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
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
                      {otherParticipant?.avatar ?? '👤'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">{otherParticipant?.name ?? '상대'}</h4>
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
                    {otherParticipant?.avatar ?? '👤'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <div>
                <h4 className="text-sm font-medium">{otherParticipant?.name ?? '상대'}</h4>
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
              room.messages.map((msg) => {
                const isMine = String(msg.senderId) === String(currentUser?.id ?? '');
                const time = toTimeStr(msg.timestamp);
                return (
                  <div key={String(msg.id)} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className="flex items-end gap-1 max-w-[70%]">
                      {!isMine && (
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-primary-glow text-white">
                            {otherParticipant?.avatar ?? '👤'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="space-y-1">
                        <div className={`px-2 py-1 rounded-lg text-xs ${isMine ? 'bg-primary text-primary-foreground ml-auto' : 'bg-muted text-foreground'}`}>
                          <p>{msg.content}</p>
                        </div>
                        <p className={`text-xs text-muted-foreground ${isMine ? 'text-right' : 'text-left'}`}>{time}</p>
                      </div>
                      {isMine && (
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-secondary">나</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>

        <div className="p-2 border-t">
          <div className="flex gap-1">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
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

function toTimeStr(ts: any) {
  const d = ts instanceof Date ? ts : new Date(ts);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true });
}