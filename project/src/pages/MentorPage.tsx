import React, { useEffect, useState } from "react";
import axios from "axios";
import Navigation from "@/components/Navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, ThumbsUp, BarChart2, Megaphone } from "lucide-react";
import { useNavigate } from "react-router-dom";

axios.defaults.withCredentials = true;

interface Mentee {
  id: number; // menteeUserId
  name: string;
  age: number;
  requestId?: number; // 멘토 요청 ID
  accuracy?: number;
  wrongRate?: number;
  questionsAsked?: number;
  feedbacksGiven?: number;
  recentSubject?: string;
}

const MentorPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Mentee[]>([]);
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [mentorId, setMentorId] = useState<number | null>(null);
  const [acceptedMenteeIds, setAcceptedMenteeIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("📡 [FRONT] /api/user 요청 보냄 (쿠키):", document.cookie);
        const userRes = await axios.get("/api/user");
        console.log("✅ [FRONT] /api/user 응답:", userRes.data);

        console.log("📡 [FRONT] /api/mentoring/mentor-id 요청");
        const mentorRes = await axios.get(`/api/mentoring/mentor-id`);
        console.log("✅ [FRONT] /api/mentoring/mentor-id 응답:", mentorRes.data);

        const mentorIdValue = mentorRes.data;
        setMentorId(mentorIdValue);

        console.log("📡 [FRONT] /api/mentoring/requests 요청");
        const reqRes = await axios.get(`/api/mentoring/requests`);
        console.log("✅ [FRONT] /api/mentoring/requests 응답:", reqRes.data);
        setRequests(reqRes.data);

        console.log("📡 [FRONT] /api/mentoring/mentees 요청");
        const menteeRes = await axios.get(`/api/mentoring/mentees`);
        console.log("✅ [FRONT] /api/mentoring/mentees 응답:", menteeRes.data);
        setMentees(menteeRes.data);
      } catch (error) {
        console.error("❌ [FRONT] 데이터 로딩 실패", error);
      }
    };

    fetchData();
  }, []);

  const handleAccept = async (mentee: Mentee) => {
    if (!mentee.requestId) {
      console.warn("⚠️ [FRONT] requestId 없음 → 수락 불가", mentee);
      return;
    }

    try {
      console.log("📡 [FRONT] 멘토 수락 API 호출:", mentee);
      const response = await axios.post("/api/mentoring/accept-request", null, {
        params: { requestId: mentee.requestId }
      });
      console.log("✅ [FRONT] 수락 응답:", response.data);

      const chatId = response.data.chatId;
      setAcceptedMenteeIds((prev) => [...prev, mentee.id]);
      setRequests((prev) => prev.filter((r) => r.id !== mentee.id));

      const menteeRes = await axios.get(`/api/mentoring/mentees`);
      console.log("📡 [FRONT] 멘티 목록 재조회:", menteeRes.data);
      setMentees(menteeRes.data);

      if (chatId) {
        console.log("➡️ [FRONT] 채팅 페이지 이동:", chatId);
        navigate(`/chat/${chatId}`);
      }
    } catch (error) {
      console.error("❌ [FRONT] 멘토 수락 실패:", error);
      alert("멘토 수락 중 오류가 발생했습니다.");
    }
  };

  const handleReject = (id: number) => {
    console.log("🚫 [FRONT] 멘토 요청 거절:", id);
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const handleReport = async (mentee: Mentee) => {
    const reason = window.prompt(`"${mentee.name}" 멘티를 신고하는 이유를 입력하세요:`);
    if (!reason || reason.trim() === "") return;

    try {
      console.log("📡 [FRONT] 신고 API 호출:", { reporterId: mentorId, menteeId: mentee.id });
      await axios.post("/api/admin/report", {
        reporterId: mentorId,
        targetUserId: mentee.id,
        targetMentorId: null,
        reason,
      });
      alert("신고가 정상적으로 접수되었습니다.");
    } catch (err) {
      console.error("❌ [FRONT] 신고 실패", err);
      alert("신고 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
      <Navigation />
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        
        {/* 멘토 요청 카드 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">멘토 요청 관리</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {requests.length === 0 ? (
              <p className="text-muted-foreground">들어온 요청이 없습니다.</p>
            ) : (
              requests.map((req) => (
                <div key={req.id} className="flex justify-between items-center border p-4 rounded-lg bg-background/50">
                  <div>
                    <p className="font-semibold">{req.name}</p>
                    <p className="text-sm text-muted-foreground">나이: {req.age}세</p>
                  </div>
                  <div className="space-x-2">
                    {acceptedMenteeIds.includes(req.id) ? (
                      <Button size="sm" disabled variant="outline">매칭 완료됨</Button>
                    ) : (
                      <>
                        <Button size="sm" onClick={() => handleAccept(req)}>수락</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleReject(req.id)}>거절</Button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* 멘토링 중인 멘티 카드 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">멘토링 중인 멘티 현황</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentees.map((mentee) => (
              <div key={mentee.id} className="border p-4 rounded-xl bg-white dark:bg-background/50 shadow-sm">
                <h3 className="text-lg font-semibold mb-1">
                  {mentee.name} ({mentee.age}세)
                </h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>정답률: <span className="font-bold text-foreground">{mentee.accuracy ?? "-"}%</span></p>
                  <p>오답률: {mentee.wrongRate ?? "-"}%</p>
                  <p>질문 횟수: {mentee.questionsAsked ?? "-"}회</p>
                  <p>피드백 제공: {mentee.feedbacksGiven ?? "-"}회</p>
                  <p>최근 학습 과목: {mentee.recentSubject ?? "정보 없음"}</p>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="secondary">멘토링 진행중</Badge>
                  <Button size="sm" variant="destructive" onClick={() => handleReport(mentee)}>
                    신고하기
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 하단 탭 */}
        <Tabs defaultValue="questions" className="w-full mt-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="questions">오늘의 질문</TabsTrigger>
            <TabsTrigger value="answers">답변 기록</TabsTrigger>
            <TabsTrigger value="feedback">멘티 피드백</TabsTrigger>
            <TabsTrigger value="stats">활동 통계</TabsTrigger>
            <TabsTrigger value="notice">공지사항</TabsTrigger>
          </TabsList>

          <TabsContent value="questions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" /> 오늘의 질문 현황
                </CardTitle>
              </CardHeader>
              <CardContent>질문 목록 (미답변 / 답변 완료 구분, 바로 답변 버튼)</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="answers">
            <Card>
              <CardHeader>
                <CardTitle><ThumbsUp className="w-5 h-5" /> 답변한 기록</CardTitle>
              </CardHeader>
              <CardContent>날짜별 답변 목록, 좋아요 수, 정답여부</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback">
            <Card>
              <CardHeader><CardTitle>멘티 피드백</CardTitle></CardHeader>
              <CardContent>점수 / 코멘트 표시</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle><BarChart2 className="w-5 h-5" /> 활동 통계</CardTitle>
              </CardHeader>
              <CardContent>누적 답변 수, 평균 시간, 그래프 시각화</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notice">
            <Card>
              <CardHeader>
                <CardTitle><Megaphone className="w-5 h-5" /> 시스템 공지사항</CardTitle>
              </CardHeader>
              <CardContent>점검, 운영 메시지 표시</CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MentorPage;
