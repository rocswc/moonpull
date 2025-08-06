import { MessageSquare, Plus, History, Settings, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const ChatSidebar = () => {
  const chatHistory = [
    "한국사 공부 방법",
    "수학 미적분 문제 해결",
    "국어 문법 정리",
    "과학 실험 보고서 작성",
    "영어 회화 연습",
  ];

  return (
    <div className="w-64 h-full bg-chat-sidebar border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <Button 
          className="w-full justify-start gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-soft"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          새 채팅
        </Button>
      </div>

      {/* Chat History */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
            최근 대화
          </div>
          {chatHistory.map((chat, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start text-left h-auto p-2 hover:bg-accent/50 text-chat-sidebar-foreground"
              size="sm"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <MessageSquare className="h-4 w-4 flex-shrink-0" />
                <span className="truncate text-sm">{chat}</span>
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-border space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-chat-sidebar-foreground hover:bg-accent/50"
          size="sm"
        >
          <History className="h-4 w-4" />
          채팅 기록
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-chat-sidebar-foreground hover:bg-accent/50"
          size="sm"
        >
          <Settings className="h-4 w-4" />
          설정
        </Button>
        <Separator />
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10"
          size="sm"
        >
          <Trash2 className="h-4 w-4" />
          대화 삭제
        </Button>
      </div>
    </div>
  );
};

export default ChatSidebar;