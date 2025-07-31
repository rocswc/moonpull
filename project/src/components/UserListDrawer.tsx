import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, UserPlus } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";
import axios from "axios";

const UserListDrawer: React.FC = () => {
  const { users, isUserListOpen, toggleUserList, sendChatRequest } = useChat();

  const onlineUsers = users.filter(user => user.isOnline);

  const handleChatRequest = (userId: string) => {
    sendChatRequest(userId);
    console.log('Chat request sent!');
  };
  interface Member {
      id: number;
      name: string;
      age: number;
      accuracy?: number;
      wrongRate?: number;
      questionsAsked?: number;
      feedbacksGiven?: number;
      recentSubject?: string;
    }
  const handleReport = async (mentee: Member) => {
    const reason = window.prompt(`"${mentee.name}" 멘토를 신고하는 이유를 입력하세요:`);

    if (!reason || reason.trim() === "") {
      alert("신고 사유를 입력해야 합니다.");
      return;
    }

    try {
      await axios.post("/api/admin/report", {
        reporterId: 1, // ❗ 실제 로그인한 멘티의 ID로 교체 필요
        targetUserId: null,
        targetMentorId: mentee.id,
        reason,
      },		{
		  withCredentials: true // 반드시 있어야 함
		}
	  );

      alert("신고가 정상적으로 접수되었습니다.");
    } catch (error) {
      console.error("신고 실패:", error);
      alert("신고 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <Sheet open={isUserListOpen} onOpenChange={toggleUserList}>
      <SheetContent side="right" className="w-80 sm:w-96">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            온라인 멘토
          </SheetTitle>
          <SheetDescription>
            현재 접속 중인 멘토들과 실시간 채팅을 시작해보세요
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-3">
          {onlineUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>현재 접속 중인 멘토가 없습니다</p>
            </div>
          ) : (
            onlineUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 bg-card rounded-lg border border-border/50 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-sm font-bold bg-gradient-to-br from-primary to-primary-glow text-white">
                        {user.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground">{user.name}</h4>
                      <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                        온라인
                        <button
                          onClick={() => handleReport(user)}
                          title="신고하기"
                          className="ml-1 text-red-500 hover:text-red-600 text-xs"
                        >
                          🚨
                        </button>
                      </span>
                    </div>
                    {user.subject && (
                      <Badge variant="outline" className="text-xs mt-1">
                        {user.subject}
                      </Badge>
                    )}
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleChatRequest(user.id)}
                  className="gap-1 text-xs"
                >
                  <MessageCircle className="h-3 w-3" />
                  채팅 요청
                </Button>
              </div>
            ))
          )}
        </div>

        {onlineUsers.length > 0 && (
          <div className="mt-6 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              💡 채팅 요청을 보내면 상대방이 수락 후 대화를 시작할 수 있습니다
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default UserListDrawer;
