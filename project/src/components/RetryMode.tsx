// src/components/RetryMode.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import type { Question } from "@/data/wrongAnswers";

interface RetryModeProps {
  questions: Question[];
  onQuestionCompleted: (questionId: number) => void;
  onBackToView: () => void;
}

const RetryMode = ({ questions, onQuestionCompleted, onBackToView }: RetryModeProps) => {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [isWrong, setIsWrong] = useState(false);

  const current = questions[index];

  const handleSubmit = () => {
    if (answer.trim() === current.correct) {
      onQuestionCompleted(current.id);
      setAnswer("");
      setIsWrong(false);
      if (index + 1 < questions.length) {
        setIndex(i => i + 1);
      } else {
        onBackToView();
      }
    } else {
      setIsWrong(true);
      setAnswer("");
    }
  };

  if (!current) {
    return (
      <div className="text-center text-muted-foreground">모든 문제를 완료했습니다!</div>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-4 py-6">
        <p className="text-foreground font-semibold">{current.question}</p>
        <ul className="space-y-1 text-sm text-muted-foreground pl-4 list-disc">
          {current.choices.map((choice, idx) => (
            <li key={idx}>{choice}</li>
          ))}
        </ul>
        <div className="flex gap-2">
          <Input
            placeholder="정답을 입력하세요"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
          />
          <Button onClick={handleSubmit}>
            확인 <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        {isWrong && (
          <p className="text-sm text-destructive">오답입니다. 다시 시도해보세요!</p>
        )}
      </CardContent>
    </Card>
  );
};

export default RetryMode;
