import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Question } from "@/data/wrongAnswers";

interface ViewWrongAnswersProps {
  questions: Question[];
  onRetryAll: () => void;
}

const ViewWrongAnswers = ({ questions, onRetryAll }: ViewWrongAnswersProps) => {
  const [index, setIndex] = useState(0);
  const current = questions[index];

  const goPrev = () => {
    if (index > 0) setIndex(index - 1);
  };

  const goNext = () => {
    if (index < questions.length - 1) setIndex(index + 1);
  };

  if (!current) {
    return <div className="text-center text-muted-foreground">문제가 없습니다.</div>;
  }

  return (
    <Card>
      <CardContent className="space-y-6 py-6">
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={goPrev} disabled={index === 0}>
            <ChevronLeft className="h-4 w-4" /> 이전
          </Button>
          <p className="text-sm text-muted-foreground">
            {index + 1} / {questions.length}
          </p>
          <Button variant="ghost" onClick={goNext} disabled={index === questions.length - 1}>
            다음 <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-lg font-medium text-foreground">{current.question}</p>
          <ul className="list-disc pl-5 text-sm text-muted-foreground">
            {current.choices.map((choice, idx) => (
              <li key={idx}>{choice}</li>
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
