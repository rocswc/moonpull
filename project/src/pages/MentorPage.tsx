import React, { useEffect, useState } from "react";
import axios from "axios";
import Navigation from "@/components/Navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, ThumbsUp, BarChart2, Megaphone, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

axios.defaults.withCredentials = true;

interface Mentee {
  id: number;
  name: string;
  age: number;
  requestId?: number;
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

const DEFAULT_MENTEE_STATS = {
  accuracy: 0,
  wrongRate: 0,
  questionsAsked: 0,
  feedbacksGiven: 0,
  recentSubject: "정보 없음",
};

const MentorPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Mentee[]>([]);
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [mentorId, setMentorId] = useState<number | null>(null);
  const [endedMentoring, setEndedMentoring] = useState<MentoringProgress[]>([]);
  
  // 알림 관련 state
  const [notificationCount, setNotificationCount] = useState(0);
  const [lastRequestCount, setLastRequestCount] = useState(0);

  /** 데이터 로딩 */
  const fetchData = async () => {
    console.group(" [FRONT] MentorPage 데이터 로딩");
    try {
      console.log("쿠키:", document.cookie || "(없음)");
      console.log("axios baseURL:", axios.defaults.baseURL || "(기본)");

      // 1. 로그인 유저 확인
      const userRes = await axios.get("/api/user");
      console.log("✅ /api/user:", userRes.data);

      // 2. mentorId 가져오기
      const mentorRes = await axios.get("/api/mentoring/mentor-id");
      const mentorIdValue = mentorRes.data.mentorId;
      setMentorId(mentorIdValue);
      console.log("✅ mentorId:", mentorIdValue);

      // 3. 멘토 요청 목록
      const reqRes = await axios.get("/api/mentoring/requests");
      const newRequests = reqRes.data;
      setRequests(newRequests);
      console.log("✅ requests:", newRequests);

      // 4. 새 요청 알림 체크
      if (newRequests.length > lastRequestCount) {
        const newCount = newRequests.length - lastRequestCount;
        setNotificationCount(prev => prev + newCount);
        
        // 브라우저 알림
        if (Notification.permission === "granted") {
          new Notification("새로운 멘토 요청", {
            body: `${newCount}개의 새로운 멘토 요청이 도착했습니다!`,
            icon: "/favicon.ico"
          });
        }
        
        // 페이지 타이틀 변경
        document.title = `(${newCount}) 새로운 요청 - 멘토 대시보드`;
        
        // 3초 후 타이틀 복원
        setTimeout(() => {
          document.title = "멘토 대시보드";
        }, 3000);
      }
      setLastRequestCount(newRequests.length);

      // 5. 멘티 목록
      const menteeRes = await axios.get("/api/mentoring/mentees");
      setMentees(menteeRes.data);
      console.log("✅ mentees:", menteeRes.data);

      // 6. 종료된 멘토링
      const progressRes = await axios.get("/api/mentoring/progress", {
        params: { mentorId: mentorIdValue },
        withCredentials: true,
      });
      const ended = progressRes.data.filter(
        (p: MentoringProgress) => p.connection_status === "ended"
      );
      setEndedMentoring(ended);
      console.log("✅ progress (종료된):", ended);
    } catch (error) {
      console.error("❌ 데이터 로딩 실패:", error);
    }
    console.groupEnd();
  };

  useEffect(() => {
    console.log(" MentorPage mounted");
    fetchData();
    
    // 브라우저 알림 권한 요청
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
    
    // 10초마다 자동 새로고침 (실시간 효과)
    const interval = setInterval(fetchData, 10000);
    
    return () => {
      console.log("🛑 MentorPage unmounted");
      clearInterval(interval);
    };
  }, []);

  // 알림 카운터 리셋
  const resetNotifications = () => {
    setNotificationCount(0);
  };

  /** 요청 수락 */
  const handleAccept = async (mentee: Mentee) => {
    if (!mentee.requestId) {
      alert("요청 정보가 올바르지 않습니다.");
      return;
    }

    try {
      const res = await axios.post(
        "/api/mentoring/accept-request",
        null,
        { params: { requestId: mentee.requestId } }
      );
      console.log("✅ accept:", res.data);

      const chatId = res.data.chatId;

      if (!chatId) {
        alert("채팅방 생성에 실패했습니다. 다시 시도해주세요.");
        return;
      }

      // 요청 목록에서 제거 + 멘티 추가
      setRequests((prev) => prev.filter((r) => r.requestId !== mentee.requestId));
      setMentees((prev) => [
        ...prev,
        { ...mentee, ...DEFAULT_MENTEE_STATS },
      ]);

      // 성공 메시지 표시
      alert(`${mentee.name} 멘티의 요청을 수락했습니다! 채팅방으로 이동합니다.`);
      
      if (chatId) navigate(`/chat/${chatId}`);
    } catch (error) {
      console.error("❌ 수락 실패:", error);
      
      // 에러 메시지 표시 (타입 안전하게)
      let errorMessage = "요청 수락에 실패했습니다. 다시 시도해주세요.";
      
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      alert(`수락 실패: ${errorMessage}`);
    }
  };

  /** 요청 거절 */
  const handleReject = async (requestId: number) => {
    try {
      await axios.post("/api/mentoring/reject-request", null, { params: { requestId } });
      setRequests((prev) => prev.filter((r) => r.requestId !== requestId));
      console.log("✅ 거절 완료:", requestId);
      alert("요청을 거절했습니다.");
    } catch (error) {
      console.error("❌ 거절 실패:", error);
      
      // 에러 메시지 표시 (타입 안전하게)
      let errorMessage = "요청 거절에 실패했습니다. 다시 시도해주세요.";
      
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      alert(`거절 실패: ${errorMessage}`);
    }
  };

  /** 멘티 신고 */
  const handleReport = async (mentee: Mentee) => {
    const reason = window.prompt(`"${mentee.name}" 멘티를 신고하는 이유를 입력하세요:`);
    if (!reason?.trim()) return;

    try {
      await axios.post("/api/admin/report", {
        reporterId: mentorId,
        targetUserId: mentee.id,
        targetMentorId: null,
        reason,
      });
      alert("신고가 접수되었습니다.");
    } catch (error) {
      console.error("❌ 신고 실패:", error);
    }
  };

  /** 종료된 멘토링 신고 */
  const handleReportMentoring = async (mentoring: MentoringProgress) => {
    const reason = window.prompt(`"${mentoring.mentee_name}" 멘티를 신고하는 이유를 입력하세요:`);
    if (!reason?.trim()) return;

    try {
      await axios.post("/api/admin/report", {
        reporterId: mentorId,
        targetUserId: mentoring.mentee_id,
        targetMentorId: null,
        reason,
      });
      alert("신고가 접수되었습니다.");
    } catch (error) {
      console.error("❌ 신고 실패:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
      <Navigation />
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        
        {/* 알림 헤더 */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">멘토 대시보드</h1>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <Badge variant="secondary" className="cursor-pointer" onClick={resetNotifications}>
              {notificationCount}
            </Badge>
            <span className="text-sm text-gray-600">10초마다 자동 새로고침</span>
          </div>
        </div>

        {/* 새 요청 알림 */}
        {notificationCount > 0 && (
          <Card className="border-green-200 bg-green-50 animate-pulse">
            <CardHeader>
              <CardTitle className="text-lg text-green-800">🔔 새로운 멘토 요청</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-700">
                {notificationCount}개의 새로운 멘토 요청이 도착했습니다!
              </p>
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-2"
                onClick={resetNotifications}
              >
                확인
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* 멘토 요청 */}
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
                    <Button size="sm" onClick={() => handleAccept(req)}>수락</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleReject(req.requestId!)}>거절</Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* 멘토링 중 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">멘토링 중인 멘티</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentees.length === 0 ? (
              <p className="text-muted-foreground col-span-full text-center py-8">멘토링 중인 멘티가 없습니다.</p>
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
                    {item.mentee_name} ({item.start_date?.slice(0, 7)} ~ {item.end_date ? item.end_date.slice(0, 7) : "진행 중"})
                  </p>
                  <p className="text-sm text-muted-foreground">채팅방 ID: {item.chat_id ?? "없음"}</p>
                  <Button size="sm" variant="destructive" onClick={() => handleReportMentoring(item)} className="mt-2">신고하기</Button>
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
              <CardHeader><CardTitle className="flex items-center gap-2"><MessageCircle className="w-5 h-5" /> 오늘의 질문 현황</CardTitle></CardHeader>
              <CardContent>질문 목록 (미답변 / 답변 완료 구분, 바로 답변 버튼)</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="answers">
            <Card>
              <CardHeader><CardTitle><ThumbsUp className="w-5 h-5" /> 답변 기록</CardTitle></CardHeader>
              <CardContent>날짜별 답변, 좋아요 수, 정답여부</CardContent>
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
              <CardHeader><CardTitle><BarChart2 className="w-5 h-5" /> 활동 통계</CardTitle></CardHeader>
              <CardContent>누적 답변 수, 평균 시간, 그래프 시각화</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notice">
            <Card>
              <CardHeader><CardTitle><Megaphone className="w-5 h-5" /> 공지사항</CardTitle></CardHeader>
              <CardContent>점검, 운영 메시지</CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MentorPage;