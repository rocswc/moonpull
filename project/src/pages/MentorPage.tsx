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

interface MentoringProgress {
  mentoring_progress_id: number;
  mentee_id: number;
  mentee_name: string;
  chat_id: number | null;
  connection_status: string;
  start_date: string;
  end_date: string | null;
}

const MentorPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Mentee[]>([]);
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [mentorId, setMentorId] = useState<number | null>(null);
  const [acceptedMenteeIds, setAcceptedMenteeIds] = useState<number[]>([]);
  const [endedMentoring, setEndedMentoring] = useState<MentoringProgress[]>([]);

  // 데이터 로딩 함수
  const fetchData = async () => {
    try {
      console.log("📡 [FRONT] 데이터 로딩 시작 -----------------------------");
      console.log("📡 현재 쿠키:", document.cookie || "(없음)");
      console.log("🔍 axios baseURL:", axios.defaults.baseURL || "(기본)");

      // 1. 로그인된 유저 정보 확인
      console.log("📤 API 호출 → GET /api/user");
      const userRes = await axios.get("/api/user");
      console.log("✅ 응답(/api/user):", JSON.stringify(userRes.data, null, 2));

      // 2. mentor-id 가져오기
      const mentorIdUrl = `/api/mentoring/mentor-id`;
      console.log("📤 API 호출 → GET", mentorIdUrl);
      const mentorRes = await axios.get(mentorIdUrl);
      console.log("✅ 응답(mentor-id):", mentorRes.data);
      const mentorIdValue = mentorRes.data.mentorId;
      setMentorId(mentorIdValue);

      // 3. 멘토 요청 목록
      const requestsUrl = `/api/mentoring/requests`;
      console.log("📤 API 호출 → GET", requestsUrl);
      const reqRes = await axios.get(requestsUrl);
      console.log("✅ 응답(requests):", JSON.stringify(reqRes.data, null, 2));
      setRequests(reqRes.data);

      // 4. 멘티 목록
      const menteesUrl = `/api/mentoring/mentees`;
      console.log("📤 API 호출 → GET", menteesUrl);
      const menteeRes = await axios.get(menteesUrl);
      console.log("✅ 응답(mentees):", JSON.stringify(menteeRes.data, null, 2));
      setMentees(menteeRes.data);

      // 5. 멘토링 진행 상황 조회 (종료된 것만)
      try {
        const progressUrl = `/api/mentoring/progress`;
        console.log("📤 API 호출 → GET", progressUrl);
        const progressRes = await axios.get(progressUrl, {
          params: { mentorId: mentorIdValue },
          withCredentials: true,
        });
        console.log("✅ 응답(progress):", progressRes.data);
        
        const all: MentoringProgress[] = progressRes.data;
        const ended = all.filter((p) => p.connection_status === "ended");
        
        setEndedMentoring(ended);
      } catch (err) {
        console.error("❌ 멘토링 진행 상황 불러오기 실패:", err);
      }

      console.log("📡 [FRONT] 데이터 로딩 완료 -----------------------------");
    } catch (error) {
      console.error("❌ [FRONT] 데이터 로딩 실패", error);
    }
  };

  useEffect(() => {
    console.log("🚀 useEffect 실행 - MentorPage 마운트됨");
    fetchData();

    return () => {
      console.log("🛑 useEffect cleanup - MentorPage 언마운트됨");
    };
  }, []);

  const handleAccept = async (mentee: Mentee) => {
    console.log("🟢 handleAccept 호출 - mentee:", mentee);
    if (!mentee.requestId) {
      console.warn("⚠️ requestId 없음 → 수락 불가", mentee);
      return;
    }
    try {
      console.log(" API 호출 → POST /api/mentoring/accept-request", { requestId: mentee.requestId });
      const response = await axios.post("/api/mentoring/accept-request", null, {
        params: { requestId: mentee.requestId },
      });
      console.log("✅ 응답(accept-request):", response.data);

      const chatId = response.data.chatId;
      
      // 수락된 멘티 ID 추가
      setAcceptedMenteeIds((prev) => [...prev, mentee.id]);
      
      // 요청 목록에서 제거
      setRequests((prev) => prev.filter((r) => r.requestId !== mentee.requestId));

      // 멘티 목록에 바로 추가 (새로고침 없이)
      const acceptedMentee: Mentee = {
        id: mentee.id,
        name: mentee.name,
        age: mentee.age,
        accuracy: 0, // 기본값
        wrongRate: 0, // 기본값
        questionsAsked: 0, // 기본값
        feedbacksGiven: 0, // 기본값
        recentSubject: "정보 없음" // 기본값
      };
      
      setMentees((prev) => [...prev, acceptedMentee]);
      console.log("✅ 멘티 목록에 바로 추가됨:", acceptedMentee);

      if (chatId) {
        console.log(`💬 채팅방 이동: /chat/${chatId}`);
        navigate(`/chat/${chatId}`);
      }
    } catch (error) {
      console.error("❌ [FRONT] 멘토 수락 실패:", error);
    }
  };

  const handleReject = async (requestId: number) => {
    console.log("🚫 handleReject 호출 - requestId:", requestId);
    try {
      console.log(" API 호출 → POST /api/mentoring/reject-request", { requestId });
      const response = await axios.post("/api/mentoring/reject-request", null, {
        params: { requestId },
      });
      console.log("✅ 응답(reject-request):", response.data);

      // 요청 목록에서 제거
      setRequests((prev) => prev.filter((r) => r.requestId !== requestId));
    } catch (error) {
      console.error("❌ [FRONT] 멘토 거절 실패:", error);
    }
  };

  const handleReport = async (mentee: Mentee) => {
    console.log("🚨 handleReport 호출 - mentee:", mentee);
    const reason = window.prompt(`"${mentee.name}" 멘티를 신고하는 이유를 입력하세요:`);
    if (!reason || reason.trim() === "") {
      console.log("❌ 신고 취소됨 - 이유 없음");
      return;
    }
    try {
      console.log(" API 호출 → POST /api/admin/report", {
        reporterId: mentorId,
        targetUserId: mentee.id,
        targetMentorId: null,
        reason,
      });
      await axios.post("/api/admin/report", {
        reporterId: mentorId,
        targetUserId: mentee.id,
        targetMentorId: null,
        reason,
      });
      alert("신고가 정상적으로 접수되었습니다.");
    } catch (err) {
      console.error("❌ [FRONT] 신고 실패", err);
    }
  };

  const handleReportMentoring = async (mentoring: MentoringProgress) => {
    console.log("🚨 handleReportMentoring 호출 - mentoring:", mentoring);
    const reason = window.prompt(`"${mentoring.mentee_name}" 멘티를 신고하는 이유를 입력하세요:`);
    if (!reason || reason.trim() === "") {
      console.log("❌ 신고 취소됨 - 이유 없음");
      return;
    }
    try {
      console.log(" API 호출 → POST /api/admin/report", {
        reporterId: mentorId,
        targetUserId: mentoring.mentee_id,
        targetMentorId: null,
        reason,
      });
      await axios.post("/api/admin/report", {
        reporterId: mentorId,
        targetUserId: mentoring.mentee_id,
        targetMentorId: null,
        reason,
      });
      alert("신고가 정상적으로 접수되었습니다.");
    } catch (err) {
      console.error("❌ [FRONT] 신고 실패", err);
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
                <div key={req.requestId} className="flex justify-between items-center border p-4 rounded-lg bg-background/50">
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
                        <Button size="sm" variant="destructive" onClick={() => handleReject(req.requestId!)}>거절</Button>
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
            {mentees.length === 0 ? (
              <p className="text-muted-foreground col-span-full text-center py-8">
                멘토링 중인 멘티가 없습니다.
              </p>
            ) : (
              mentees.map((mentee) => (
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
                    <Button size="sm" variant="destructive" onClick={() => handleReport(mentee)}>신고하기</Button>
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
            {endedMentoring.length === 0 ? (
              <p className="text-muted-foreground">종료된 멘토링이 없습니다.</p>
            ) : (
              endedMentoring.map((item) => (
                <div key={item.mentoring_progress_id} className="p-3 border rounded-md">
                  <p className="font-medium">
                    {item.mentee_name} ({item.start_date?.slice(0, 7)} ~ {item.end_date !== null ? item.end_date.slice(0, 7) : "진행 중"})
                  </p>
                  <p className="text-sm text-muted-foreground">채팅방 ID: {item.chat_id ?? "없음"}</p>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleReportMentoring(item)}
                    className="mt-2"
                  >
                    신고하기
                  </Button>
                </div>
              ))
            )}
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