import Navigation from "@/components/Navigation";
import ViewWrongAnswers from "@/components/ViewWrongAnswers";
import RetryMode from "@/components/RetryMode";
import { wrongAnswerQuestions, Question } from "@/data/wrongAnswers";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, RotateCcw, Brain, Target, TrendingUp } from "lucide-react";

const WrongNotePage = () => {
  const [questions, setQuestions] = useState<Question[]>(wrongAnswerQuestions);
  const [activeTab, setActiveTab] = useState("view");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const subjects = Array.from(new Set(wrongAnswerQuestions.map((q) => q.subject)));
  const filteredQuestions = questions.filter((q) => q.subject === selectedSubject);
  const incompleteQuestions = filteredQuestions.filter((q) => !q.isCompleted);
  const completedCount = filteredQuestions.length - incompleteQuestions.length;

  const handleQuestionCompleted = (questionId: number) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, isCompleted: true } : q))
    );
  };

  const handleRetryAll = () => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.subject === selectedSubject ? { ...q, isCompleted: false } : q
      )
    );
    setActiveTab("retry");
  };

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
                  onClick={() => setSelectedSubject(subject)}
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
                  <TabsContent value="view" className="mt-0">
                    <ViewWrongAnswers
                      questions={filteredQuestions}
                      onRetryAll={handleRetryAll} // 누르면 activeTab="retry"
                    />
                  </TabsContent>

                  <TabsContent value="retry" className="mt-0">
                    <RetryMode
                      questions={incompleteQuestions}
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
