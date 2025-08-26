import Navigation from "@/components/Navigation";
import ViewWrongAnswers from "@/components/ViewWrongAnswers";
import RetryMode from "@/components/RetryMode";
import { useState, useEffect} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, RotateCcw, Brain, Target, TrendingUp } from "lucide-react";

import type { Question } from "@/data/wrongAnswers";
import axios from "axios";

// 백엔드 오답 API
const WRONG_API = "https://localhost:8080/api/wrong-answers"; // 포트/도메인 맞추세요

type UIQuestion = Question & { mongoId: string };

// Mongo 컬럼 스키마(스크린샷 기준)
type WrongDoc = {
  id?: string;
  _id?: string;
  userId: number;
  questionId: string;
  subject: string;
  school: string;
  grade: string;          // "2"
  question: string;
  passage?: string;
  choices: string[];
  answer?: string[];      // 정답 텍스트 1개가 배열로 옴
  explanation?: string;   // "해설: ..." 접두 가능
  userAnswer: string;     // "1" 등
  createdAt: string;
  isCorrect: boolean;
};

// 과목 고정 목록(요구사항: 국어/한국사/영어)
const SUBJECTS = ["국어", "한국사", "영어"];
const WrongNotePage = () => {

  const [questions, setQuestions] = useState<UIQuestion[]>([]);
  const [activeTab, setActiveTab] = useState("view");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const subjects = SUBJECTS;
  const filteredQuestions = questions.filter((q) => q.subject === selectedSubject);
  const incompleteQuestions = filteredQuestions.filter((q) => !q.isCompleted);
  const completedCount = filteredQuestions.length - incompleteQuestions.length;

  const [viewIndex, setViewIndex] = useState(0);                 // 오답 목록에서 보고 있는 인덱스
  const [currentQuestionId, setCurrentQuestionId] = useState<number | null>(null);
 
  // 로그인 사용자 ID 확보(프로젝트의 me/user 엔드포인트에 맞춰 조정)
  useEffect(() => {
    axios.get("/api/user")
      .then(res => setUserId(Number(res.data.user.userId)))
      .catch(() => setUserId(null));
  }, []);

 const handleQuestionCompleted = (questionId: number) => {
    // 먼저 mongoId 확보
    const docId = questions.find(q => q.id === questionId)?.mongoId;

    // 1) 낙관적 UI 업데이트: 지우지 말고 isCompleted=true로 표시
    setQuestions(prev =>
      prev.map(q => q.id === questionId ? { ...q, isCompleted: true } : q)
    );

   // 2) 서버 soft-resolve (isCorrect=true) 호출
   if (docId) {
     fetch(`${WRONG_API}/${docId}/resolve?correct=true`, { method: "POST" })
       .catch(console.error);
   }

  // 3) 보기 탭 인덱스 이동(현재 항목은 완료됐으니 다음 미완료로 이동)
  const idxInView = incompleteQuestions.findIndex(q => q.id === questionId);
  if (idxInView >= 0) {
    const nextIndex = Math.min(idxInView, Math.max(0, incompleteQuestions.length - 2));
    setViewIndex(nextIndex);
  }

 };

  useEffect(() => {
    if (!selectedSubject || userId == null) return;
    loadWrongAnswers(selectedSubject);
  }, [selectedSubject, userId]);

  useEffect(() => {
    if (incompleteQuestions.length > 0) {
      const idx = Math.min(viewIndex, incompleteQuestions.length - 1);
      setCurrentQuestionId(incompleteQuestions[idx].id);
    } else {
      setCurrentQuestionId(null);
    }
  }, [incompleteQuestions, viewIndex]);

  const handleRetryAll = () => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.subject === selectedSubject ? { ...q, isCompleted: false } : q
      )
    );
    setActiveTab("retry");
  };

  const loadWrongAnswers = async (subject: string) => {
    const params = new URLSearchParams({ userId: String(userId), subject });
    const res = await fetch(`${WRONG_API}?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const docs: WrongDoc[] = await res.json();

  // Mongo → UIQuestion 매핑 (문서 id를 직접 보관)
    const mapped: UIQuestion[] = docs.map((d, i) => ({
      id: i + 1,                                  // UI용 숫자 id
      mongoId: (d._id ?? d.id)!,                  // ✅ Mongo 문서 id
      question: d.question,
      choices: d.choices ?? [],
      correct: Array.isArray(d.answer) && d.answer.length ? d.answer[0] : "",
      explanation: (d.explanation || "").replace(/^해설:\s*/, ""),
      isCompleted: false,
      subject: d.subject,
 }));
 setQuestions(mapped);
  };

  const retryStartIndex = (() => {
    if (!currentQuestionId) return 0;
    const idx = incompleteQuestions.findIndex(q => q.id === currentQuestionId);
    return idx >= 0 ? idx : 0;
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
      <Navigation />
      <div className="max-w-6xl mx-auto px-6 py-8">
        {!selectedSubject ? (
          <div className="text-center space-y-6">
            <h1 className="text-3xl font-bold text-foreground">과목을 선택하세요</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {subjects.map((subject) => (
                <Card
                  key={subject}
                  onClick={() => {
                    setSelectedSubject(subject);
                    setActiveTab("view");
                    setViewIndex(0);
                    setCurrentQuestionId(null);
                   }}
                   className="cursor-pointer border-2 hover:border-primary min-h-[6rem] flex items-center justify-center"
                >
                  <CardHeader className="p-0">
                    <CardTitle className="text-xl font-semibold text-center">
                      {subject}
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">
                  {selectedSubject} 오답노트
                </h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                틀린 문제를 체계적으로 복습하고 반복 학습하여 실력을 향상시켜보세요
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="shadow-card bg-gradient-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">총 문제 수</p>
                      <p className="text-2xl font-bold text-foreground">
                        {filteredQuestions.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card bg-gradient-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                      <Target className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">완료된 문제</p>
                      <p className="text-2xl font-bold text-foreground">
                        {completedCount}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card bg-gradient-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">정답률</p>
                      <p className="text-2xl font-bold text-foreground">
                        {filteredQuestions.length > 0
                          ? Math.round((completedCount / filteredQuestions.length) * 100)
                          : 0}
                        %
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-elegant">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <CardHeader>
                  <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                    <TabsTrigger value="view">📚 오답 목록</TabsTrigger>
                    <TabsTrigger value="retry">🔁 재도전</TabsTrigger>
                  </TabsList>
                </CardHeader>

                <CardContent className="p-6">
                  <TabsContent value="view" forceMount hidden={activeTab !== "view"} className="mt-0">
                    <ViewWrongAnswers
                      key={`view-${selectedSubject ?? ''}`}   // ⬅ 과목이 바뀔 때만 초기화
                      questions={incompleteQuestions}     // ✅ 미완료만
                      currentIndex={viewIndex}
                      onIndexChange={(i) => {
                        const clamped = Math.max(0, Math.min(i, incompleteQuestions.length - 1)); // ✅ 길이 기준도 변경
                        setViewIndex(clamped);
                        const q = incompleteQuestions[clamped];
                        setCurrentQuestionId(q?.id ?? null);
                      }}
                      onRetryAll={handleRetryAll} // 누르면 activeTab="retry"
                    />
                  </TabsContent>

                  <TabsContent value="retry" forceMount hidden={activeTab !== "retry"} className="mt-0">
                    <RetryMode
                      key={`retry-${selectedSubject ?? ''}`}  // ⬅ 과목이 바뀔 때만 초기화
                      questions={incompleteQuestions}
                      startIndex={retryStartIndex}      // ⬅ 여기 추가
                      onQuestionCompleted={handleQuestionCompleted}
                      onBackToView={() => setActiveTab("view")}
                    />
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>

            <div className="text-center mt-8">
              <p className="text-sm text-muted-foreground">
                💡 꾸준한 복습이 실력 향상의 지름길입니다
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WrongNotePage;
