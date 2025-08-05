import React, { useState, useEffect } from "react";
import axios from "axios";
import Navigation from "@/components/Navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useChat } from "@/contexts/ChatContext"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, UserCheck, RotateCcw, LineChart } from "lucide-react";
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// 타입 정의
interface MentoringProgress {
  mentoring_progress_id: number;
  mentor_id: number;
  mentor_name: string;
  chat_id: number | null;
  connection_status: string;
  start_date: string;
  end_date: string | null;
}

interface Mentor {
  id: number;
  name: string;
  subject: string;
  rating: number;
  experience: string;
  intro: string;
}

const MenteePage = () => {
  const [mentors] = useState<Mentor[]>([
    {
      id: 1,
      name: "김역사",
      subject: "한국사",
      rating: 4.9,
      experience: "10년",
      intro: "서울대 한국사 전공, 풍부한 강의 경력",
    },
    {
      id: 2,
      name: "이수학",
      subject: "수학",
      rating: 4.7,
      experience: "7년",
      intro: "수능 대비 수학 전문가, 개념 중심 학습",
    },
  ]);

  const [activeList, setActiveList] = useState<MentoringProgress[]>([]);
  const [endedList, setEndedList] = useState<MentoringProgress[]>([]);
  const { currentUser } = useChat();
  useEffect(() => {
    if (!currentUser) return; // 로그인 유저가 로드되지 않으면 요청 X

    axios
      .get("/api/mentoring/progress", {
        params: { menteeId: currentUser.id },
        withCredentials: true,
      })
      .then((res) => {
        console.log("👀 받은 데이터:", res.data);
        const all: MentoringProgress[] = res.data;
        const active = all.filter((p) => p.connection_status !== "ended");
        const ended = all.filter((p) => p.connection_status === "ended");

        setActiveList(active);
        setEndedList(ended);
      })
      .catch((err) => {
        console.error("❌ 멘토링 현황 불러오기 실패:", err);
      });
  }, [currentUser]); // currentUser 바뀔 때마다 실행

   // 로그인 유저 정보

  const handleReport = async (mentor: Mentor) => {
    const reason = window.prompt(`"${mentor.name}" 멘토를 신고하는 이유를 입력하세요:`);
    if (!reason || reason.trim() === "") {
      alert("신고 사유를 입력해야 합니다.");
      return;
    }

    try {
      await axios.post("/api/admin/report", {
        reporterId: currentUser.id,           // ✅ 현재 유저 ID 사용
        targetUserId: mentor.id,
        targetMentorId: mentor.id,
        reason: reason,
      });
      alert("신고가 정상적으로 접수되었습니다.");
    } catch (err) {
      console.error("신고 실패", err);
      alert("신고 처리 중 오류가 발생했습니다.");
    }
  };

  const wrongAnswers = [
    { id: 101, question: "임진왜란 발생 연도는?", subject: "한국사" },
    { id: 102, question: "미분 가능 조건은?", subject: "수학" },
  ];

  const weeklyStats = [
    { day: "월", questions: 3, answers: 2 },
    { day: "화", questions: 5, answers: 4 },
    { day: "수", questions: 2, answers: 1 },
    { day: "목", questions: 6, answers: 5 },
    { day: "금", questions: 4, answers: 3 },
    { day: "토", questions: 1, answers: 1 },
    { day: "일", questions: 3, answers: 2 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
      <Navigation />
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">

        {/* 나의 멘토 목록 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">나의 멘토 목록</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <div key={mentor.id} className="border p-4 rounded-xl bg-white dark:bg-background/50 shadow-sm">
                <h3 className="text-lg font-semibold mb-1">{mentor.name} ({mentor.subject})</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>평균 평점: {mentor.rating}</p>
                  <p>경력: {mentor.experience}</p>
                  <p>{mentor.intro}</p>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="secondary">멘토 연결됨</Badge>
                  <Button size="sm" variant="destructive" onClick={() => handleReport(mentor)}>신고하기</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 진행 중 멘토링 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">멘토링 중인 멘토 현황</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeList.length === 0 ? (
              <p className="text-muted-foreground">진행 중인 멘토링이 없습니다.</p>
            ) : (
              activeList.map((item) => (
                <div key={item.mentoring_progress_id} className="p-3 border rounded-md">
                  <p className="font-medium">멘토: {item.mentor_name}</p>
                  <p className="text-sm text-muted-foreground">채팅방 ID: {item.chat_id ?? "없음"}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* 종료된 멘토링 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">종료된 멘토링</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {endedList.length === 0 ? (
              <p className="text-muted-foreground">종료된 멘토링이 없습니다.</p>
            ) : (
              endedList.map((item) => (
                <div key={item.mentoring_progress_id} className="p-3 border rounded-md">
				<p className="font-medium">
				  {item.mentor_name} ({item.start_date?.slice(0, 7)} ~ {item.end_date !== null ? item.end_date.slice(0, 7) : "진행 중"})
				</p>


                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      handleReport({
                        id: item.mentor_id,
                        name: item.mentor_name,
                        subject: "",
                        rating: 0,
                        experience: "",
                        intro: "",
                      })
                    }
                    className="mt-2"
                  >
                    신고하기
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* 탭 영역 */}
        <Tabs defaultValue="questions" className="w-full mt-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="questions">내 질문 현황</TabsTrigger>
            <TabsTrigger value="answers">답변 받은 기록</TabsTrigger>
            <TabsTrigger value="wrong">오답노트</TabsTrigger>
            <TabsTrigger value="stats">질문/답변 통계</TabsTrigger>
          </TabsList>

          <TabsContent value="questions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" /> 내 질문 현황
                </CardTitle>
              </CardHeader>
              <CardContent>질문 목록 (답변 대기 / 완료 구분, 수정/삭제 기능 등)</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="answers">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5" /> 답변 받은 기록
                </CardTitle>
              </CardHeader>
              <CardContent>답변 리스트, 평점 남기기 기능 등</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wrong">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="w-5 h-5" /> 오답노트
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {wrongAnswers.map((item) => (
                  <div key={item.id} className="p-3 bg-background border rounded-md flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.question}</p>
                      <p className="text-sm text-muted-foreground">과목: {item.subject}</p>
                    </div>
                    <Button size="sm" variant="outline">다시 도전</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5" /> 최근 질문/답변 통계
                </CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ReLineChart data={weeklyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="questions" stroke="#8884d8" name="질문 수" />
                    <Line type="monotone" dataKey="answers" stroke="#82ca9d" name="답변 수" />
                  </ReLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MenteePage;
