import React, { useEffect, useState } from "react";
import axios from "axios";
import Navigation from "@/components/Navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams } from "react-router-dom";
import { MessageCircle, SendHorizonal } from "lucide-react";

axios.defaults.withCredentials = true;

interface Message {
  id: number;
  senderId: number;
  senderName: string;
  content: string;
  timestamp: string;
}

interface Mentee {
  id: number;
  name: string;
  age: number;
}

const MentorChat = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [mentee, setMentee] = useState<Mentee | null>(null);
  const [mentorId, setMentorId] = useState<number | null>(null);

  // 데이터 로딩
  const fetchChatData = async () => {
    try {
      console.log("📡 [FRONT] 채팅 데이터 로딩 시작 -------------------");

      // 1. 로그인된 유저 정보 확인
      const userRes = await axios.get("/api/user");
      console.log("✅ 응답(/api/user):", userRes.data);
      setMentorId(userRes.data.userId);

      // 2. 채팅방 메시지 가져오기
      const msgRes = await axios.get(`/api/chat/${chatId}/messages`);
      console.log("✅ 응답(chat-messages):", msgRes.data);
      setMessages(msgRes.data);

      // 3. 멘티 정보 가져오기
      const menteeRes = await axios.get(`/api/chat/${chatId}/mentee`);
      console.log("✅ 응답(mentee-info):", menteeRes.data);
      setMentee(menteeRes.data);

      console.log("📡 [FRONT] 채팅 데이터 로딩 완료 -------------------");
    } catch (err) {
      console.error("❌ 채팅 데이터 로딩 실패:", err);
    }
  };

  useEffect(() => {
    fetchChatData();
  }, [chatId]);

  // 메시지 전송
  const handleSend = async () => {
    if (!input.trim()) return;

    try {
      const newMessage = {
        senderId: mentorId,
        content: input.trim(),
        chatId,
      };

      console.log("📤 API 호출 → POST /api/chat/send", newMessage);
      const res = await axios.post("/api/chat/send", newMessage);
      console.log("✅ 응답(send):", res.data);

      // 메시지 목록 갱신
      setMessages((prev) => [...prev, res.data]);
      setInput("");
    } catch (err) {
      console.error("❌ 메시지 전송 실패:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
      <Navigation />
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              {mentee ? `${mentee.name} (${mentee.age}세)와의 채팅` : "채팅방"}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {/* 채팅 메시지 영역 */}
            <ScrollArea className="h-[500px] w-full rounded-md border p-4 bg-white dark:bg-background/50">
              <div className="flex flex-col gap-3">
                {messages.length === 0 ? (
                  <p className="text-muted-foreground text-center">
                    아직 메시지가 없습니다.
                  </p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.senderId === mentorId
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg shadow ${
                          msg.senderId === mentorId
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700"
                        }`}
                      >
                        <p className="text-sm font-semibold">
                          {msg.senderName}
                        </p>
                        <p>{msg.content}</p>
                        <p className="text-xs opacity-70 text-right mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* 입력창 */}
            <div className="flex gap-2 mt-4">
              <Input
                placeholder="메시지를 입력하세요..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <Button onClick={handleSend}>
                <SendHorizonal className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MentorChat;
