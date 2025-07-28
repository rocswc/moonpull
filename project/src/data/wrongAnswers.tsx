// src/data/wrongAnswers.ts

export interface Question {
  id: number;
  question: string;
  choices: string[];
  correct: string;
  explanation: string;
  isCompleted: boolean;
  subject: string;
}

export const wrongAnswerQuestions: Question[] = [
  {
    id: 1,
    question: "다음 중 주어의 높임이 올바르게 사용된 문장은?",
    choices: ["선생님이 왔다.", "선생님이 오셨다.", "선생님이 온다.", "선생님이 오시다."],
    correct: "선생님이 오셨다.",
    explanation: "'오셨다'는 '오다'의 높임 표현으로 주체 높임법이 적용된 예입니다.",
    isCompleted: false,
    subject: "국어",
  },
  {
    id: 2,
    question: "조선 시대에 실시된 과거 시험의 목적은?",
    choices: ["군사 모집", "세금 징수", "관료 선발", "형벌 집행"],
    correct: "관료 선발",
    explanation: "과거 시험은 관리를 선발하기 위한 시험 제도였습니다.",
    isCompleted: false,
    subject: "한국사",
  },
  {
    id: 3,
    question: "다음 중 소수는 무엇인가요?",
    choices: ["4", "6", "11", "15"],
    correct: "11",
    explanation: "11은 1과 자기 자신만을 약수로 가지므로 소수입니다.",
    isCompleted: false,
    subject: "수학",
  },
];

