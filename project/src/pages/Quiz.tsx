import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { CheckCircle, XCircle, RotateCcw, BookOpen, TrendingUp, Award } from "lucide-react";

const subjects = [
  {
    id: "korean",
    name: "국어",
    questions: [
      {
        id: "k1",
        question: "'죽다' 대신 사용하는 완곡어는 무엇인가요?",
        passage: "우리 언어 공동체의 담화 관습에서 직접적이고 거친 표현을 피하고 부드럽고 완곡한 표현을 선호하는 경향이 있습니다.",
        choices: [
          "일어나다, 돌아오다, 쉬다",
          "가다, 오다, 들다",
          "자다, 쉬다, 떠나다",
          "먹다, 마시다, 웃다",
          "사망하다, 별세하다, 타계하다",
        ],
        correctIndexes: [4],
        explanation: "'사망하다', '별세하다', '타계하다'는 '죽다'의 완곡어 표현입니다."
      }
    ]
  },
  {
    id: "history",
    name: "한국사",
    questions: [
      {
        id: "h1",
        question: "조선 시대의 과거 제도 중 문과는 어떤 인재를 선발하기 위한 시험이었나요?",
        passage: "조선 시대에는 과거 시험을 통해 관리를 선발했습니다. 문과는 일반적으로 유학(儒學)에 능한 사람들을 대상으로 했습니다.",
        choices: ["무예에 능한 사람", "예술적 재능이 있는 사람", "과학 기술자", "유학에 능한 사람", "법률 전문가"],
        correctIndexes: [3],
        explanation: "문과는 성리학에 기반한 유학을 중심으로 한 시험으로, 유학에 능한 사람들을 대상으로 한 시험입니다."
      }
    ]
  },
  {
    id: "math",
    name: "수학",
    questions: [
      {
        id: "m1",
        question: "다음 중 소수는 무엇인가요?",
        passage: "소수는 1과 자기 자신만을 약수로 가지는 수를 말합니다.",
        choices: ["4", "6", "9", "11", "15"],
        correctIndexes: [3],
        explanation: "11은 1과 11만을 약수로 가지므로 소수입니다."
      }
    ]
  }
];

const QuizPage = () => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [isFinished, setIsFinished] = useState(false);

  const subject = subjects.find((s) => s.id === selectedSubjectId);
  const questions = subject?.questions ?? [];
  const currentQuestion = questions[currentIndex];

  const checkAnswer = () => {
    const isCorrect =
      selectedIndexes.length === currentQuestion.correctIndexes.length &&
      selectedIndexes.every((v) => currentQuestion.correctIndexes.includes(v));

    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      wrong: prev.wrong + (!isCorrect ? 1 : 0),
    }));

    setShowExplanation(true);
  };

  const nextQuestion = () => {
    setSelectedIndexes([]);
    setShowExplanation(false);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsFinished(true);
    }
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setSelectedIndexes([]);
    setShowExplanation(false);
    setScore({ correct: 0, wrong: 0 });
    setIsFinished(false);
    setSelectedSubjectId(null);
  };

  const toggleChoice = (index: number) => {
    if (showExplanation) return;
    setSelectedIndexes([index]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
      <Navigation />
      <div className="max-w-6xl mx-auto px-6 py-8">
        {!selectedSubjectId ? (
          <div className="text-center space-y-6">
            <h1 className="text-3xl font-bold text-foreground">과목을 선택하세요</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {subjects.map((subject) => (
                <Card
                  key={subject.id}
                  className="cursor-pointer border-2 hover:border-primary min-h-[6rem] flex items-center justify-center"
                  onClick={() => setSelectedSubjectId(subject.id)}
                >
                  <CardHeader className="p-0">
                    <CardTitle className="text-xl font-semibold text-center">
                      {subject.name}
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        ) : isFinished ? (
          <div className="text-center space-y-8">
            <h2 className="text-2xl font-bold text-foreground">퀴즈 완료!</h2>
            <p className="text-muted-foreground">
              정답: {score.correct} / 오답: {score.wrong}
            </p>
            <Button onClick={restartQuiz} variant="hero" size="lg">
              다시 시작하기
            </Button>
          </div>
        ) : (
          currentQuestion && (
            <Card className="shadow-elegant mb-6">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">
                  {currentQuestion.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 rounded-xl p-4 border-l-4 border-primary">
                  <p className="text-sm font-medium text-muted-foreground mb-2">📖 지문</p>
                  <p className="text-foreground leading-relaxed">{currentQuestion.passage}</p>
                </div>
                <div className="grid gap-3">
                  {currentQuestion.choices.map((choice, idx) => {
                    const isSelected = selectedIndexes.includes(idx);
                    const isCorrect = currentQuestion.correctIndexes.includes(idx);

                    let cardStyle = "cursor-pointer border-2 p-4 rounded-xl ";
                    if (showExplanation) {
                      cardStyle += isCorrect
                        ? "border-green-500 bg-green-50"
                        : isSelected
                        ? "border-red-500 bg-red-50"
                        : "border-muted";
                    } else {
                      cardStyle += isSelected
                        ? "border-primary bg-primary/10"
                        : "border-muted";
                    }

                    return (
                      <div
                        key={idx}
                        className={cardStyle}
                        onClick={() => toggleChoice(idx)}
                      >
                        {choice}
                      </div>
                    );
                  })}
                </div>
                {showExplanation && (
                  <div className="bg-muted/50 rounded-xl p-4 border-l-4 border-primary mt-4">
                    <p className="text-sm font-bold text-foreground">📚 해설</p>
                    <p className="text-muted-foreground">{currentQuestion.explanation}</p>
                  </div>
                )}
                <div className="text-center">
                  {!showExplanation ? (
                    <Button
                      onClick={checkAnswer}
                      disabled={selectedIndexes.length === 0}
                      variant="hero"
                    >
                      정답 제출
                    </Button>
                  ) : (
                    <Button onClick={nextQuestion} variant="hero">
                      다음 문제
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
};

export default QuizPage;
