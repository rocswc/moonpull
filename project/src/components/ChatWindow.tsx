import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Minimize2, X, Send, Phone, Video, GripVertical } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";

const ReportModal = ({ target, reporterId, onClose }: { target: { messageId: string; content: string; targetUserId: string }; reporterId: string; onClose: () => void }) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    setSubmitting(true);
    try {
      await fetch('/api/admin/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterId: Number(reporterId),
          targetUserId: Number(target.targetUserId),
          chatMessageMongoId: String(target.messageId),
          reason,
          reportType: "CHAT",
        }),
      });
      onClose();
    } catch (err) {
      console.error('신고 실패:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl w-80 p-4 space-y-3">
        <h2 className="text-lg font-semibold">채팅 신고</h2>
        <p className="text-sm text-muted-foreground">"{target.content}"</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full border rounded p-2 text-sm"
          placeholder="신고 사유 입력 (ex. 욕설, 도배 등)"
          rows={3}
        />
        <div className="flex justify-end gap-2">
          <Button onClick={onClose} variant="secondary" size="sm">취소</Button>
          <Button onClick={handleSubmit} disabled={submitting || !reason.trim()} size="sm">신고</Button>
        </div>
      </div>
    </div>
  );
};

const CHAT_LOG_URL = '/api/chat/log';
function persistChatLog({ roomId, senderId, receiverId, content, timestamp }: { roomId: string; senderId: string; receiverId: string; content: string; timestamp: string }) {
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
      }).catch(() => {});
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
  const { chatRooms, sendMessage, minimizeChat, closeChat, markAsRead, currentUser } = useChat();
 const roomData = chatRooms.find(r => r.id === room.id);

  const [message, setMessage] = useState('');
  const [position, setPosition] = useState({ x: typeof window !== 'undefined' ? Math.max(0, window.innerWidth - 400) : 0, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const lastMarkedRef = useRef<string | number | null>(null);
  const [reportTarget, setReportTarget] = useState<null | { messageId: string; content: string; targetUserId: string }>(null);

  if (!roomData) return null;

  const otherParticipant = useMemo(() => {
    const meId = currentUser?.id?.toString();
    return roomData.participants.find(p => p.id.toString() !== meId) || roomData.participants[0];
  }, [roomData.participants, currentUser?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [roomData.messages.length]);

  useEffect(() => {
    if (!currentUser?.id) return;
    if (roomData.isMinimized) return;
    const len = roomData.messages.length;
    if (len === 0) return;

    const last = roomData.messages[len - 1];
    const lastFromOther = String(last.senderId) !== String(currentUser.id);

    if (lastFromOther && last.id !== lastMarkedRef.current) {
      markAsRead(roomData.id);
      lastMarkedRef.current = last.id;
    }
  }, [roomData.messages, roomData.isMinimized, currentUser?.id, roomData.id, markAsRead]);

  useEffect(() => {
    if (!roomData.isMinimized && roomData.unreadCount > 0) {
      markAsRead(roomData.id);
    }
  }, [roomData.isMinimized, roomData.unreadCount, roomData.id, markAsRead]);

  const handleSendMessage = () => {
    const text = message.trim();
    if (!text) return;
    sendMessage(roomData.id, text);

    const receiverId = otherParticipant?.id?.toString() ?? '';
    persistChatLog({
      roomId: roomData.id.toString(),
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

  if (roomData.isMinimized) return null;

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
              <Button variant="ghost" size="sm" onClick={() => minimizeChat(roomData.id)} className="h-6 w-6 p-0"><Minimize2 className="h-3 w-3" /></Button>
              <Button variant="ghost" size="sm" onClick={() => closeChat(roomData.id)} className="h-6 w-6 p-0"><X className="h-3 w-3" /></Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-3 overflow-y-auto bg-background/50">
          <div className="space-y-2">
            {roomData.messages.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-xs">대화를 시작해보세요! 👋</p>
              </div>
            ) : (
              roomData.messages.map((msg, index) => {
                const isMine = String(msg.senderId) === String(currentUser?.id ?? '');
                const time = toTimeStr(msg.timestamp);
                const key = (() => {
                  try {
                    return `msg-${typeof msg.id === 'object' ? JSON.stringify(msg.id) : String(msg.id)}-${index}`;
                  } catch {
                    return `msg-fallback-${index}`;
                  }
                })();

                return (
                  <div key={key} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
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
                        <div className="flex items-center justify-between">
                          <p className={`text-xs text-muted-foreground ${isMine ? 'text-right' : 'text-left'}`}>{time}</p>
                          {!isMine && (
                            <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => setReportTarget({ messageId: String(msg.id), content: msg.content, targetUserId: String(msg.senderId) })}>
                              <span className="text-xs text-red-500">🚨</span>
                            </Button>
                          )}
                        </div>
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
            <Input value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={handleKeyDown} placeholder="메시지 입력..." className="text-xs h-8" />
            <Button onClick={handleSendMessage} disabled={!message.trim()} size="sm" className="h-8 px-2">
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </Card>

      {reportTarget && (
        <ReportModal target={reportTarget} onClose={() => setReportTarget(null)} reporterId={String(currentUser?.id ?? '')} />
      )}
    </div>
  );
};

export default ChatWindow;

function toTimeStr(ts: any) {
  const d = ts instanceof Date ? ts : new Date(ts);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true });
}
