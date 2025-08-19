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
  experience: string;  // ← 백엔드에서 "10년" 이런 식으로 내려옴
  intro: string;
}

const MenteePage = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [activeList, setActiveList] = useState<MentoringProgress[]>([]);
  const [endedList, setEndedList] = useState<MentoringProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useChat();

  // 멘토 목록 가져오기
  const fetchMyMentors = async () => {
    try {
      const response = await axios.get("/api/mentee/my-mentors", {
        withCredentials: true
      });
      setMentors(response.data);
    } catch (error) {
      console.error("멘토 목록 가져오기 실패:", error);
      setMentors([]);
    }
  };

  // 멘토링 진행 상황 가져오기
  const fetchMentoringProgress = async () => {
    if (!currentUser) return;

    try {
      const response = await axios.get("/api/mentoring/progress", {
        params: { menteeId: currentUser.id },
        withCredentials: true,
      });
      
      const all: MentoringProgress[] = response.data;
      const active = all.filter((p) => p.connection_status !== "ended");
      const ended = all.filter((p) => p.connection_status === "ended");

      setActiveList(active);
      setEndedList(ended);
    } catch (error) {
      console.error("멘토링 현황 불러오기 실패:", error);
      setActiveList([]);
      setEndedList([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchMyMentors();
      await fetchMentoringProgress();
      setLoading(false);
    };

    if (currentUser) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  // 🔥 멘토링 끝내기
  const handleEndMentoring = async (progressId: number) => {
    try {
      await axios.post(
        "/api/mentoring/end",
        null,
        {
          params: { progressId },
          withCredentials: true
        }
      );

      // active → ended 로컬 반영
      setActiveList((prev) => prev.filter((p) => p.mentoring_progress_id !== progressId));
      const endedMentor = activeList.find((p) => p.mentoring_progress_id === progressId);
      if (endedMentor) {
        setEndedList((prev) => [
          ...prev, 
          { ...endedMentor, connection_status: "ended", end_date: new Date().toISOString() }
        ]);
      }

      alert("멘토링이 종료되었습니다.");
    } catch (err) {
      console.error("멘토링 종료 실패:", err);
      alert("멘토링 종료 중 오류가 발생했습니다.");
    }
  };

  // 신고하기
  const handleReport = async (mentor: Mentor) => {
    const reason = window.prompt(`"${mentor.name}" 멘토를 신고하는 이유를 입력하세요:`);
    if (!reason || reason.trim() === "") {
      alert("신고 사유를 입력해야 합니다.");
      return;
    }

    try {
      await axios.post("/api/admin/report", {
        reporterId: currentUser?.id,           
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <Navigation />
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="text-center">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
      <Navigation />
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">

        {/* 멘토링 중인 멘토 현황 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">멘토링 중인 멘토 현황</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.length === 0 ? (
              <p className="text-muted-foreground col-span-full text-center py-8">
                매칭된 멘토가 없습니다. 멘토를 찾아보세요!
              </p>
            ) : (
              mentors.map((mentor) => (
                <div key={mentor.id} className="border p-4 rounded-xl bg-white dark:bg-background/50 shadow-sm">
                  <h3 className="text-lg font-semibold mb-1">{mentor.name} ({mentor.subject})</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>경력: {mentor.experience}</p>
                    <p>{mentor.intro}</p>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="secondary">멘토 연결됨</Badge>
                    {/* 종료하기 버튼 */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEndMentoring(mentor.id)}
                    >
                      종료하기
                    </Button>
                    {/* 신고하기 버튼 */}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReport(mentor)}
                    >
                      신고하기
                    </Button>
                  </div>
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
                    {item.mentor_name} ({item.start_date?.slice(0, 10)} ~ {item.end_date ? item.end_date.slice(0, 10) : "진행 중"})
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* 탭 영역 (질문, 답변, 오답노트, 통계) */}
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
