import { useEffect } from "react";
import {
  Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import {
  BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { useKeywordStore } from "@/store/useKeywordStore";

const LogMonitoring = () => {
  const { setTrendingKeywords } = useKeywordStore();

  // ✅ ① 인기 검색어
  const searchKeywords = [
    { keyword: "광개토대왕", count: 847 },
    { keyword: "미적분", count: 623 },
    { keyword: "officially", count: 589 },
    { keyword: "이순신", count: 442 },
    { keyword: "세종대왕", count: 398 },
  ];

  // ✅ ② 멘토 응답 시간 평균 (단위: 분)
  const mentorResponseTime = [
    { week: "1주차", avgTime: 22 },
    { week: "2주차", avgTime: 19 },
    { week: "3주차", avgTime: 17 },
    { week: "4주차", avgTime: 15 },
    { week: "5주차", avgTime: 12 },
  ];

  // ✅ ③ 채팅방 주요 단어
  const chatWords = [
    { word: "감사합니다", count: 220 },
    { word: "다시요", count: 180 },
    { word: "질문", count: 160 },
    { word: "설명", count: 130 },
    { word: "이해", count: 100 },
  ];
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  // ✅ ④ 과목별 오답 TOP3
  const wrongAnswers = [
    { subject: "국어", question: "문학 갈래 구분", count: 32 },
    { subject: "국어", question: "문법 용언 활용", count: 28 },
    { subject: "국어", question: "독서 개념어", count: 26 },
    { subject: "수학", question: "미분 개념", count: 35 },
    { subject: "수학", question: "적분 활용", count: 30 },
    { subject: "수학", question: "지수로그 함수", count: 29 },
    { subject: "한국사", question: "삼국 통일", count: 24 },
    { subject: "한국사", question: "근대 개혁", count: 22 },
    { subject: "한국사", question: "일제 강점기", count: 20 },
  ];

  // zustand에 등록
  useEffect(() => {
    setTrendingKeywords(searchKeywords.map(k => k.keyword));
  }, [setTrendingKeywords]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      
      {/* ① 인기 검색어 */}
      <Card>
        <CardHeader>
          <CardTitle>인기 검색어 TOP 5</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={searchKeywords}>
              <XAxis dataKey="keyword" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ② 멘토 응답 시간 평균 */}
      <Card>
        <CardHeader>
          <CardTitle>멘토 응답 시간 평균 추이</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={mentorResponseTime}>
              <XAxis dataKey="week" />
              <YAxis unit="분" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="avgTime"
                stroke="#8884d8"
                fill="#e0e7ff"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ③ 채팅 주요 단어 */}
      <Card>
        <CardHeader>
          <CardTitle>채팅방 주요 단어 TOP 5</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chatWords}
                dataKey="count"
                nameKey="word"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {chatWords.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ④ 과목별 오답 TOP 3 */}
      <Card>
        <CardHeader>
          <CardTitle>과목별 오답 TOP 3</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={wrongAnswers}>
              <XAxis dataKey="question" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#FF8042" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogMonitoring;
