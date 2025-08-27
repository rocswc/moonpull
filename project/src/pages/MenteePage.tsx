import React, { useState, useEffect } from "react";
import axios from "axios";
import Navigation from "@/components/Navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useChat } from "@/contexts/ChatContext"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, UserCheck, RotateCcw, LineChart } from "lucide-react";
import { useLanguageStore } from "@/store/useLanguageStore";
import { useTranslation } from "@/hooks/useTranslation";
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

interface Question {
  questionId: number;
  title: string;
  content: string;
  status: string;
  answerContent?: string;
  createdAt?: string;
  answeredAt?: string;
}

interface WrongAnswer {
  _id: string;
  subject: string;
  question: string;
  userAnswer: string;
  answer: string;         // 정답 번호나 텍스트
  explanation: string;    // 정답 해설
  createdAt: string;
}

const MenteePage = () => {
  const { language } = useLanguageStore();
  const { t } = useTranslation(language);
  
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [activeList, setActiveList] = useState<MentoringProgress[]>([]);
  const [endedList, setEndedList] = useState<MentoringProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useChat();

  // 질문 state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  
  // 멘티 정보
  const [menteeInfo, setMenteeInfo] = useState<{menteeId: number, name: string} | null>(null);

  // 오답노트 state
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([]);

  // 멘티 정보 가져오기
  const fetchMenteeInfo = async () => {
    try {
      const response = await axios.get("/api/mentee/my-info", { withCredentials: true });
      setMenteeInfo(response.data);
    } catch {
      setMenteeInfo(null);
    }
  };

  // 멘토 목록
  const fetchMyMentors = async () => {
    try {
      const response = await axios.get("/api/mentee/my-mentors", { withCredentials: true });
      setMentors(response.data);
    } catch {
      setMentors([]);
    }
  };

  // 멘토링 진행 상황
  const fetchMentoringProgress = async () => {
    if (!menteeInfo) return;
    try {
      const response = await axios.get("/api/mentoring/progress", {
        params: { menteeId: menteeInfo.menteeId },
        withCredentials: true,
      });
      const all: MentoringProgress[] = response.data;
      setActiveList(all.filter((p) => p.connection_status !== "ended"));
      setEndedList(all.filter((p) => p.connection_status === "ended"));
    } catch {
      setActiveList([]);
      setEndedList([]);
    }
  };

  // 질문 목록
  const fetchQuestions = async () => {
    try {
      const response = await axios.get("/api/questions/mentee", { withCredentials: true });
      setQuestions(response.data);
    } catch {
      setQuestions([]);
    }
  };

  // ✅ 오답노트 불러오기 (수정된 버전)
  const fetchWrongAnswers = async () => {
    if (!currentUser) return;  // ✅ currentUser 체크 추가
    try {
      const response = await axios.get("/api/wrong-answers", {
        params: { userId: String(currentUser.id) },  // ✅ 실제 사용자 ID 사용
        withCredentials: true,
      });
      console.log("📌 WrongAnswers API response:", response.data);
      setWrongAnswers(response.data);
    } catch {
      setWrongAnswers([]);
    }
  };


  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchMenteeInfo();
      await fetchMyMentors();
      await fetchQuestions();
      setLoading(false);
    };
    if (currentUser) loadData();
    else setLoading(false);
  }, [currentUser]);

  useEffect(() => {
    if (menteeInfo) {
      fetchMentoringProgress();
      fetchWrongAnswers();  // ✅ 오답노트도 함께 로드
    }
  }, [menteeInfo]);

  useEffect(() => {
    if (menteeInfo) {
      fetchMentoringProgress();
      fetchQuestions();
      fetchWrongAnswers();  // ✅ 오답노트도 함께 로드
      const interval = setInterval(() => {
        fetchMentoringProgress();
        fetchQuestions();
        fetchWrongAnswers();  // ✅ 오답노트도 함께 로드
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [menteeInfo]);

  // 질문 등록
  const handleSubmitQuestion = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      alert(t("enterTitleAndContent", "mentee"));
      return;
    }
    if (activeList.length === 0) {
      alert(t("noMentoringMentor", "mentee"));
      return;
    }
    try {
      const selectedMentor = activeList[0];
      await axios.post("/api/questions/create", {
        mentorId: selectedMentor.mentor_id,
        subject: "일반",
        title: newTitle,
        content: newContent
      }, { withCredentials: true });
      setNewTitle("");
      setNewContent("");
      await fetchQuestions();
      alert(t("questionRegistered", "mentee"));
    } catch {
      alert(t("questionRegisterFailed", "mentee"));
    }
  };

  // 멘토링 종료
  const handleEndMentoring = async (mentorId: number) => {
    try {
      const mentoringProgress = activeList.find(p => p.mentor_id === mentorId);
      if (!mentoringProgress) {
        alert("멘토링 진행 정보를 찾을 수 없습니다.");
        return;
      }
      await axios.post(`/api/mentoring/end/${mentoringProgress.mentoring_progress_id}`, null, { withCredentials: true });
      fetchMentoringProgress();
      alert(t("mentoringEnded", "mentee"));
    } catch {
      alert(t("mentoringEndFailed", "mentee"));
    }
  };

  // 신고하기
  const handleReport = async (mentor: Mentor) => {
    const reason = window.prompt(`${mentor.name} ${t("enterReportReason", "mentee")}`);
    if (!reason?.trim()) return;
    try {
      await axios.post("/api/admin/report", {
        reporterId: currentUser?.id,           
        targetUserId: mentor.id,
        targetMentorId: mentor.id,
        reason,
      });
      alert(t("reportSubmitted", "mentee"));
    } catch {
      alert(t("reportFailed", "mentee"));
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return t("noDate", "mentee");
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <Navigation />
        <div className="max-w-7xl mx-auto px-6 py-10 text-center">
          {t("loading", "common")}
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
          <CardHeader className="bg-purple-100 dark:bg-purple-900 rounded-t-xl">
            <CardTitle className="text-xl font-bold">{t("mentoringStatus", "mentee")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.length === 0 ? (
              <p className="text-muted-foreground col-span-full text-center py-8">
                {t("noMatchedMentors", "mentee")}
              </p>
            ) : (
              mentors.map((mentor) => (
                <div key={mentor.id} className="border p-4 rounded-xl bg-white dark:bg-background/50 shadow-sm">
                  <h3 className="text-lg font-semibold mb-1">{mentor.name} ({mentor.subject})</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{t("career", "mentee")}: {mentor.experience}</p>
                    <p>{mentor.intro}</p>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="secondary">{t("inProgress", "mentee")}</Badge>
                    <Button size="sm" variant="outline" onClick={() => handleEndMentoring(mentor.id)}>{t("end", "mentee")}</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleReport(mentor)}>{t("report", "mentee")}</Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* 종료된 멘토링 */}
        <Card>
          <CardHeader className="bg-gray-100 dark:bg-gray-800 rounded-t-xl">
            <CardTitle className="text-lg font-bold">{t("endedMentoring", "mentee")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {endedList.length === 0 ? (
              <p className="text-muted-foreground">{t("noEndedMentoring", "mentee")}</p>
            ) : (
              endedList.map((item) => (
                <div key={item.mentoring_progress_id} className="p-3 border rounded-md bg-white dark:bg-background/50 flex justify-between items-center">
                  <p className="font-medium">
                    {item.mentor_name} ({formatDate(item.start_date)} ~ {item.end_date ? formatDate(item.end_date) : t("inProgressStatus", "mentee")})
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* 탭 영역 */}
        <Tabs defaultValue="questions" className="w-full mt-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="questions">{t("myQuestionStatus", "mentee")}</TabsTrigger>
            <TabsTrigger value="answers">{t("answerHistory", "mentee")}</TabsTrigger>
            <TabsTrigger value="wrong">{t("wrongNote", "mentee")}</TabsTrigger>
            <TabsTrigger value="stats">{t("questionAnswerStats", "mentee")}</TabsTrigger>
          </TabsList>

          {/* 내 질문 현황 */}
          <TabsContent value="questions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" /> {t("myQuestionStatus", "mentee")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 입력 */}
                <div className="space-y-3 p-4 border rounded-md bg-background">
                  <input
                    type="text"
                    placeholder={t("enterTitle", "mentee")}
                    className="w-full p-2 border rounded-md"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                  <textarea
                    placeholder={t("enterContent", "mentee")}
                    className="w-full p-2 border rounded-md h-24"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                  />
                  <Button onClick={handleSubmitQuestion}>{t("registerQuestion", "mentee")}</Button>
                </div>
                {/* 질문 목록 */}
                <div className="space-y-3">
                  {questions.length === 0 ? (
                    <p className="text-muted-foreground">{t("noRegisteredQuestions", "mentee")}</p>
                  ) : (
                    questions.map((q) => (
                      <div key={q.questionId} className="p-3 border rounded-md bg-white dark:bg-background/50">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">{q.title}</h3>
                          <Badge variant={q.status === "PENDING" ? "secondary" : "default"}>{q.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{q.content}</p>
                        {q.answerContent && (
                          <p className="mt-2 text-green-600 text-sm">{t("answer", "mentee")}: {q.answerContent}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 답변 기록 */}
          <TabsContent value="answers">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5" /> {t("answerHistory", "mentee")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {questions.filter(q => q.status === 'ANSWERED').length === 0 ? (
                  <p className="text-muted-foreground">{t("noAnsweredQuestions", "mentee")}</p>
                ) : (
                  questions.filter(q => q.status === 'ANSWERED').map((q) => (
                    <div key={q.questionId} className="p-3 border rounded-md bg-white dark:bg-background/50">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{q.title}</h3>
                        <Badge variant="default">{t("answerComplete", "mentee")}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{q.content}</p>
                      {q.answerContent && (
                        <p className="mt-2 text-green-600 text-sm">{t("answer", "mentee")}: {q.answerContent}</p>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

		  {/* ✅ 수정된 오답노트 */}
		  <TabsContent value="wrong">
		    <Card>
		      <CardHeader>
		        <CardTitle className="flex items-center gap-2">
		          <RotateCcw className="w-5 h-5" /> {t("wrongNote", "mentee")}
		        </CardTitle>
		      </CardHeader>
		      <CardContent className="space-y-6">
		        {wrongAnswers.length === 0 ? (
		          <p className="text-muted-foreground"> {t("noWrongAnswers", "mentee")}</p>
		        ) : (
		          ["국어", "한국사", "수학"].map((subject) => {
		            const subjectAnswers = wrongAnswers.filter((w) =>
		              w.subject?.includes(subject)
		            );
		            if (subjectAnswers.length === 0) return null;

		            console.log(`�� ${subject} 오답 데이터:`, subjectAnswers);

		            return (
		              <div key={subject} className="space-y-3">
		                <h3 className="font-bold text-lg">{subject}</h3>
		                {subjectAnswers.map((w, idx) => (
		                  <div
		                    key={`${w._id}-${idx}`}
		                    className="p-3 border rounded-md bg-white dark:bg-background/50"
		                  >
		                    <p className="font-medium">{t("problem", "mentee")}: {w.question}</p>
		                    <p className="text-red-600">{t("myAnswer", "mentee")}: {w.userAnswer}</p>
		                    <p className="text-green-600">
		                      {t("correctAnswer", "mentee")}: {Array.isArray(w.answer) ? w.answer.join(", ") : w.answer}
		                    </p>
		                    {w.explanation && (
		                      <p className="text-sm text-muted-foreground">{t("explanation", "mentee")}: {w.explanation}</p>
		                    )}
		                    <p className="text-xs text-muted-foreground">
		                      {new Date(w.createdAt).toLocaleString("ko-KR")}
		                    </p>
		                  </div>
		                ))}
		              </div>
		            );
		          })
		        )}
		      </CardContent>
		    </Card>
		  </TabsContent>


          {/* 질문/답변 통계 */}
          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5" /> {t("recentStats", "mentee")}
                </CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ReLineChart data={[
                    { day: "월", questions: 3, answers: 2 },
                    { day: "화", questions: 5, answers: 4 },
                    { day: "수", questions: 2, answers: 1 },
                    { day: "목", questions: 6, answers: 5 },
                    { day: "금", questions: 4, answers: 3 },
                    { day: "토", questions: 1, answers: 1 },
                    { day: "일", questions: 3, answers: 2 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="questions" stroke="#8884d8" name={t("questionCount", "mentee")} />
                    <Line type="monotone" dataKey="answers" stroke="#82ca9d" name={t("answerCount", "mentee")} />
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