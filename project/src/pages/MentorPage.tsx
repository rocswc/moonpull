import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Navigation from "@/components/Navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, ThumbsUp, Megaphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguageStore } from "@/store/useLanguageStore";
import { useTranslation } from "@/hooks/useTranslation";

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

interface Question {
  questionId: number;
  menteeId: number;
  mentorId: number;
  menteeName: string;
  mentorName: string;
  subject: string;
  title: string;
  content: string;
  status: string;
  createdAt: string;
  answeredAt?: string;
  answerContent?: string;
}

const DEFAULT_MENTEE_STATS = {
  accuracy: 0,
  wrongRate: 0,
  questionsAsked: 0,
  feedbacksGiven: 0,
  recentSubject: "정보 없음",
};

const MentorPage: React.FC = () => {
  const { language } = useLanguageStore();
  const { t } = useTranslation(language);
  const navigate = useNavigate();

  const [requests, setRequests] = useState<Mentee[]>([]);
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [mentorId, setMentorId] = useState<number | null>(null);
  const [endedMentoring, setEndedMentoring] = useState<MentoringProgress[]>([]);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [pendingQuestions, setPendingQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [answerContent, setAnswerContent] = useState("");

  /** 데이터 로딩 */
  const fetchData = useCallback(async () => {
    try {
      const mentorRes = await axios.get("/api/mentoring/mentor-id");
      const mentorIdValue = mentorRes.data.mentorId;
      setMentorId(mentorIdValue);

      const reqRes = await axios.get("/api/mentoring/requests");
      setRequests(reqRes.data);

      const menteeRes = await axios.get("/api/mentoring/mentees");
      setMentees(menteeRes.data);

      const progressRes = await axios.get("/api/mentoring/progress/mentor", {
        params: { mentorId: mentorIdValue },
      });
      const ended = progressRes.data.filter(
        (p: MentoringProgress) => p.connection_status === "ended"
      );
      setEndedMentoring(ended);

      const questionsRes = await axios.get("/api/questions/mentor");
      setQuestions(questionsRes.data);

      const pendingRes = await axios.get("/api/questions/mentor/pending");
      setPendingQuestions(pendingRes.data);

    } catch (error) {
      console.error("❌ 데이터 로딩 실패:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  /** 요청 수락 */
  const handleAccept = async (mentee: Mentee) => {
    if (!mentee.requestId) return;
    try {
      const res = await axios.post(
        "/api/mentoring/accept-request",
        null,
        { params: { requestId: mentee.requestId } }
      );
      const chatId = res.data.chatId;
      setRequests((prev) => prev.filter((r) => r.requestId !== mentee.requestId));
      setMentees((prev) => [...prev, { ...mentee, ...DEFAULT_MENTEE_STATS }]);
      navigate(`/chat/${chatId}`);
    } catch {
      alert(t("acceptFailed", "mentor"));
    }
  };

  /** 요청 거절 */
  const handleReject = async (requestId: number) => {
    try {
      await axios.post("/api/mentoring/reject-request", null, { params: { requestId } });
      setRequests((prev) => prev.filter((r) => r.requestId !== requestId));
    } catch {
      alert(t("rejectFailed", "mentor"));
    }
  };

  /** 답변 */
  const handleAnswerQuestion = async () => {
    if (!selectedQuestion || !answerContent.trim()) return;
    try {
      await axios.post(`/api/questions/${selectedQuestion.questionId}/answer`, {
        answerContent: answerContent.trim()
      });
      setSelectedQuestion(null);
      setAnswerContent("");
      fetchData();
    } catch {
      alert(t("answerRegisterFailed", "mentor"));
    }
  };

  /** 신고 */
  const handleReport = async (mentee: Mentee) => {
    const reason = window.prompt(`${mentee.name} ${t("enterReportReason", "mentor")}`);
    if (!reason?.trim() || !mentorId) return;
    try {
      await axios.post("/api/admin/report", {
        reporterId: mentorId,
        targetUserId: mentee.id,
        reason,
      });
      alert(t("reportSubmitted", "mentor"));
    } catch {
      alert(t("reportFailed", "mentor"));
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("ko-KR");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
      <Navigation />
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">

        {/* 멘토 요청 관리 - 심플 버전 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">{t("requestManagement", "mentor")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {requests.length === 0 ? (
              <p className="text-muted-foreground">{t("noRequests", "mentor")}</p>
            ) : (
              requests.map((req) => (
                <div key={req.requestId} className="flex justify-between items-center border p-4 rounded-lg bg-white dark:bg-background/50 shadow-sm">
                  <div>
                    <p className="font-semibold">{req.name}</p>
                    <p className="text-sm text-muted-foreground">{t("age", "mentor")}: {req.age}세</p>
                  </div>
                  <div className="space-x-2">
                    <Button size="sm" onClick={() => handleAccept(req)}>{t("accept", "mentor")}</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleReject(req.requestId!)}>{t("reject", "mentor")}</Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* 멘토링 중인 멘티 */}
        <Card>
          <CardHeader className="bg-purple-100 dark:bg-purple-900 rounded-t-xl">
            <CardTitle className="text-xl font-bold">{t("mentoringMentees", "mentor")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentees.length === 0 ? (
              <p className="text-muted-foreground col-span-full text-center py-8">{t("noMentoringMentees", "mentor")}</p>
            ) : (
              mentees.map((mentee) => (
                <div key={mentee.id} className="border p-4 rounded-xl bg-white dark:bg-background/50 shadow-sm">
                  <h3 className="text-lg font-semibold mb-1">{mentee.name} ({mentee.age}세)</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{t("accuracy", "mentor")}: {mentee.accuracy ?? "-"}%</p>
                    <p>{t("wrongRate", "mentor")}: {mentee.wrongRate ?? "-"}%</p>
                    <p>{t("questionsAsked", "mentor")}: {mentee.questionsAsked ?? "-"}회</p>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="secondary">{t("inProgress", "mentor")}</Badge>
                    <Button size="sm" variant="destructive" onClick={() => handleReport(mentee)}>{t("report", "mentor")}</Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* 종료된 멘토링 */}
        <Card>
          <CardHeader className="bg-gray-100 dark:bg-gray-800 rounded-t-xl">
            <CardTitle className="text-lg font-bold">{t("endedMentoring", "mentor")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {endedMentoring.length === 0 ? (
              <p className="text-muted-foreground">{t("noEndedMentoring", "mentor")}</p>
            ) : (
              endedMentoring.map((item) => (
                <div key={item.mentoring_progress_id} className="p-3 border rounded-md bg-white dark:bg-background/50">
                  <p className="font-medium">
                    {item.mentee_name} ({formatDate(item.start_date)} ~ {item.end_date ? formatDate(item.end_date) : t("inProgressStatus", "mentor")})
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* 탭 */}
        <Tabs defaultValue="questions" className="w-full mt-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="questions">{t("todaysQuestions", "mentor")}</TabsTrigger>
            <TabsTrigger value="answers">{t("answerHistory", "mentor")}</TabsTrigger>
            <TabsTrigger value="notice">{t("notice", "mentor")}</TabsTrigger>
          </TabsList>

          {/* 오늘의 질문 */}
          <TabsContent value="questions">
            <Card>
              <CardHeader><CardTitle><MessageCircle className="w-5 h-5" /> {t("todaysQuestions", "mentor")}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {pendingQuestions.length === 0 ? (
                  <p className="text-muted-foreground">{t("noPendingQuestions", "mentor")}</p>
                ) : (
                  pendingQuestions.map((q) => (
                    <div key={q.questionId} className="border p-4 rounded-lg bg-white dark:bg-background/50 shadow-sm">
                      <h3 className="font-semibold">{q.title}</h3>
                      <p className="text-sm text-muted-foreground">{q.menteeName} • {q.subject} • {formatDate(q.createdAt)}</p>
                      <p className="mt-2">{q.content}</p>
                      <Button size="sm" className="mt-2" onClick={() => setSelectedQuestion(q)}>{t("answerQuestion", "mentor")}</Button>
                    </div>
                  ))
                )}

                {selectedQuestion && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-2xl">
                      <h2 className="text-xl font-bold mb-4">{t("questionAnswer", "mentor")}</h2>
                      <textarea
                        value={answerContent}
                        onChange={(e) => setAnswerContent(e.target.value)}
                        className="w-full h-32 p-3 border rounded-md resize-none"
                        placeholder={t("enterAnswer", "mentor")}
                      />
                      <div className="flex gap-2 mt-3">
                        <Button onClick={handleAnswerQuestion}>{t("register", "mentor")}</Button>
                        <Button variant="outline" onClick={() => setSelectedQuestion(null)}>{t("cancel", "mentor")}</Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 답변 기록 */}
          <TabsContent value="answers">
            <Card>
              <CardHeader><CardTitle><ThumbsUp className="w-5 h-5" /> {t("answerHistory", "mentor")}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {questions.filter(q => q.status === "ANSWERED").length === 0 ? (
                  <p className="text-muted-foreground">{t("noAnsweredQuestions", "mentor")}</p>
                ) : (
                  questions.filter(q => q.status === "ANSWERED").map((q) => (
                    <div key={q.questionId} className="border p-4 rounded-lg bg-white dark:bg-background/50 shadow-sm">
                      <h3 className="font-semibold">{q.title}</h3>
                      <p className="text-sm text-muted-foreground">{q.menteeName} • {q.subject}</p>
                      <p className="mt-2">{q.content}</p>
                      <p className="text-green-600 mt-2">{t("answer", "mentor")}: {q.answerContent}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 공지사항 */ }
          <TabsContent value="notice">
            <Card>
              <CardHeader><CardTitle><Megaphone className="w-5 h-5" /> {t("notice", "mentor")}</CardTitle></CardHeader>
              <CardContent>{t("maintenanceMessage", "mentor")}</CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MentorPage;
