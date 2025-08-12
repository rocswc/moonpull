import React from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, UserPlus } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";

const UserListDrawer: React.FC = () => {
  const { users, isUserListOpen, toggleUserList, sendChatRequest, currentUser, reportUser } = useChat();

  const onlineUsers = users.filter((u) => u.isOnline && u.id !== currentUser?.id);

  const handleChatRequest = async (userId: string) => {
    await sendChatRequest(userId); // ✅ 실제 /api/rt-chat/requests 호출 → 수신자 STOMP 푸시
  };

  return (
    <Sheet open={isUserListOpen} onOpenChange={toggleUserList}>
      <SheetContent side="right" className="w-80 sm:w-96 h-full flex flex-col">
        <SheetHeader className="shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />온라인 멘토
          </SheetTitle>
          <SheetDescription>현재 접속 중인 멘토들과 실시간 채팅을 시작해보세요</SheetDescription>
        </SheetHeader>

        <div className="mt-4 flex-1 overflow-y-auto space-y-3 pr-2" aria-label="온라인 멘토 목록">
          {onlineUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>현재 접속 중인 멘토가 없습니다</p>
            </div>
          ) : (
            onlineUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-card rounded-lg border border-border/50 hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-sm font-bold bg-gradient-to-br from-primary to-primary-glow text-white">
                        {user.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground">{user.name}</h4>
                      <span className="text-xs text-green-600 font-medium">온라인</span>
                      <button onClick={() => reportUser(user)} title="신고하기" className="ml-1 text-red-500 hover:text-red-600 text-xs">🚨</button>
                    </div>
                    {user.subject && <Badge variant="outline" className="text-xs mt-1">{user.subject}</Badge>}
                  </div>
                </div>

                <Button size="sm" variant="default" onClick={() => handleChatRequest(user.id)} className="gap-1 text-xs">
                  <MessageCircle className="h-3 w-3" />채팅 요청
                </Button>
              </div>
            ))
          )}
        </div>

        {onlineUsers.length > 0 && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg shrink-0">
            <p className="text-xs text-muted-foreground text-center">💡 채팅 요청을 보내면 상대방이 수락 후 대화를 시작할 수 있습니다</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default UserListDrawer;