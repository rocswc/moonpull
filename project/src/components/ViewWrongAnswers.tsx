import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Question } from "@/data/wrongAnswers";

interface ViewWrongAnswersProps {
  questions: Question[];
  onRetryAll: () => void;

  // ✅ 추가: 부모 제어용
  currentIndex?: number;
  onIndexChange?: (i: number) => void;
}

const ViewWrongAnswers = ({
  questions,
  onRetryAll,
  currentIndex,
  onIndexChange,
}: ViewWrongAnswersProps) => {
  // 비제어 모드용 내부 state
  const [uncontrolledIndex, setUncontrolledIndex] = useState(0);

  // ✅ 제어/비제어 겸용 처리
  const controlled = typeof currentIndex === "number";
  const idx = controlled ? (currentIndex as number) : uncontrolledIndex;
  const setIdx = (i: number) =>
    controlled ? onIndexChange?.(i) : setUncontrolledIndex(i);

  const current = questions[idx];

  const goPrev = () => {
    if (idx > 0) setIdx(idx - 1);
  };

  const goNext = () => {
    if (idx < questions.length - 1) setIdx(idx + 1);
  };

  if (!current) {
    return <div className="text-center text-muted-foreground">문제가 없습니다.</div>;
  }

  return (
    <Card>
      <CardContent className="space-y-6 py-6">
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={goPrev} disabled={idx === 0}>
            <ChevronLeft className="h-4 w-4" /> 이전
          </Button>
          <p className="text-sm text-muted-foreground">
            {idx + 1} / {questions.length}
          </p>
          <Button variant="ghost" onClick={goNext} disabled={idx === questions.length - 1}>
            다음 <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-lg font-medium text-foreground">{current.question}</p>
          <ul className="list-disc pl-5 text-sm text-muted-foreground">
            {current.choices.map((choice, i) => (
              <li key={i}>{choice}</li>
            ))}
          </ul>
          <p className="text-sm text-primary">정답: {current.correct}</p>
          <p className="text-sm text-muted-foreground">해설: {current.explanation}</p>
        </div>

        <div className="text-center pt-4">
          <Button onClick={onRetryAll} variant="outline">
            다시풀기 시작하기
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ViewWrongAnswers;