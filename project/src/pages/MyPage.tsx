import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const subjects = ["국어", "한국사", "수학"];

const sampleAccuracy = {
  국어: [
    { date: "7/01", accuracy: 80 },
    { date: "7/05", accuracy: 85 },
    { date: "7/10", accuracy: 90 },
  ],
  한국사: [
    { date: "7/01", accuracy: 60 },
    { date: "7/05", accuracy: 70 },
    { date: "7/10", accuracy: 75 },
  ],
  수학: [
    { date: "7/01", accuracy: 50 },
    { date: "7/05", accuracy: 65 },
    { date: "7/10", accuracy: 70 },
  ],
};

const cumulativeLearning = [
  { subject: "국어", totalQuestions: 120 },
  { subject: "한국사", totalQuestions: 90 },
  { subject: "수학", totalQuestions: 150 },
];

const MyPage = () => {
  const [selectedSubject, setSelectedSubject] = useState("국어");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
      <Navigation />
      <div className="flex max-w-7xl mx-auto px-6 py-10 gap-8">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-background rounded-2xl shadow p-6 space-y-4">
          <h2 className="text-xl font-bold mb-4">마이페이지</h2>
          <nav className="flex flex-col gap-3">
            <Link to="/profileEdit">
              <Button variant="outline" className="justify-start w-full">정보 수정</Button>
            </Link>
            <Link to="/subscriptionStatus">
              <Button variant="outline" className="justify-start w-full">구독 현황</Button>
            </Link>
            <Link to="/mypage">
              <Button variant="outline" className="justify-start w-full">학습 현황</Button>
            </Link>
            <Link to="/mentorReview">
              <Button variant="outline" className="justify-start w-full">멘토 평가하기</Button>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-10">
          {/* 과목별 정답률 */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold">과목별 정답률</CardTitle>
              <div className="flex gap-2">
                {subjects.map((subj) => (
                  <Button
                    key={subj}
                    size="sm"
                    variant={selectedSubject === subj ? "hero" : "outline"}
                    onClick={() => setSelectedSubject(subj)}
                  >
                    {subj}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={sampleAccuracy[selectedSubject]}>
                  <Line type="monotone" dataKey="accuracy" stroke="#8884d8" strokeWidth={2} />
                  <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
                  <Tooltip formatter={(value: number) => `${value}%`} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 과목별 누적 학습량 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">과목별 누적 학습량</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={cumulativeLearning}>
                  <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `${value}문제`} />
                  <Bar dataKey="totalQuestions" fill="#82ca9d" barSize={40} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default MyPage;
