import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, AlertTriangle, MessageSquare, Search, Lock, Ban, Eye, Info } from "lucide-react";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

const AnomalyDetection = () => {
  const [selectedTab, setSelectedTab] = useState("spam-detection");

  const spamActivities = [
    { id: 1, user: "user_123", activity: "반복 검색", count: 45, timeframe: "1시간", risk: "high" },
    { id: 2, user: "user_456", activity: "스팸 채팅", count: 23, timeframe: "30분", risk: "medium" },
    { id: 3, user: "user_789", activity: "중복 질문", count: 12, timeframe: "2시간", risk: "low" },
  ];

  const reportLogs = [
    {
      id: 1,
      user: "user_abc",
      reporter: "reporter_1",
      content: "욕설 포함 메시지",
      count: 4,
      reason: "비속어 사용",
      timestamp: "2024-07-20 14:30",
      status: "활성",
    },
    {
      id: 2,
      user: "user_def",
      reporter: "reporter_2",
      content: "차별적 언사",
      count: 2,
      reason: "혐오 표현",
      timestamp: "2024-07-20 13:15",
      status: "활성",
    },
    {
      id: 3,
      user: "user_ghi",
      reporter: "reporter_3",
      content: "부적절한 단어 사용",
      count: 5,
      reason: "음란성 내용",
      timestamp: "2024-07-20 12:45",
      status: "비활성",
    },
  ];

  const offensiveTopWords = [
    { name: "XX놈", value: 120, color: "#ef4444" },
    { name: "꺼져", value: 95, color: "#f97316" },
    { name: "ㅅㅂ", value: 80, color: "#eab308" },
  ];

  const topReportedUsers = reportLogs
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map((log) => ({ name: log.user, value: log.count }));

  const handleBlockUser = (userId: string) => {
    if (confirm(`사용자 ${userId}를 차단하시겠습니까?`)) {
      alert(`사용자 ${userId}가 차단되었습니다.`);
    }
  };

  const handleToggleUserStatus = (id: number) => {
    const reason = prompt("비활성화 사유를 입력하세요:");
    if (reason) {
      alert(`ID ${id} 비활성화 완료. 사유: ${reason}`);
    }
  };

  const handleViewDetails = (id: number) => {
    alert(`상세 정보를 확인합니다. ID: ${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-elegant bg-gradient-card border border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-admin-warning" />
              자주 사용된 욕설 Top 3
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={offensiveTopWords}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {offensiveTopWords.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value}회`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {offensiveTopWords.map((word, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: word.color }}
                  />
                  <span className="text-sm text-muted-foreground">{word.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant bg-gradient-card border border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-admin-danger" />
              신고 횟수 Top 3 사용자
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topReportedUsers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => `${value}회`} />
                <Bar dataKey="value" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

     // 기존 코드 생략 ...
      {/* 기존 Tabs 영역 유지 */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/50">
          <TabsTrigger value="spam-detection" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Search className="h-4 w-4" />
            스팸/반복 활동
          </TabsTrigger>
          <TabsTrigger value="offensive-words" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Info className="h-4 w-4" />
            신고 내용 확인
          </TabsTrigger>
        </TabsList>

        <TabsContent value="spam-detection" className="mt-6">
          <Card className="shadow-elegant bg-gradient-card border border-border/50">
            <CardHeader>
              <CardTitle>스팸/반복 활동 탐지</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {spamActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/30">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-admin-danger/10 rounded-full flex items-center justify-center">
                        <Search className="w-5 h-5 text-admin-danger" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{activity.user}</h3>
                        <p className="text-sm text-muted-foreground">{activity.activity}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{activity.count}회</p>
                        <p className="text-sm text-muted-foreground">{activity.timeframe}</p>
                      </div>
                      <Badge variant={activity.risk === "high" ? "destructive" : activity.risk === "medium" ? "secondary" : "outline"}>
                        {activity.risk === "high" ? "높음" : activity.risk === "medium" ? "보통" : "낮음"}
                      </Badge>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleViewDetails(activity.id)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleBlockUser(activity.user)}>
                          <Ban className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offensive-words" className="mt-6">
          <Card className="shadow-elegant bg-gradient-card border border-border/50">
            <CardHeader>
              <CardTitle>신고 내용 상세</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/30">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-admin-warning/10 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-admin-warning" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{log.user}</h3>
                        <p className="text-sm text-muted-foreground">{log.content}</p>
                        <p className="text-sm text-muted-foreground">신고자: {log.reporter}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{log.timestamp}</p>
                        <p className="text-sm text-muted-foreground">신고 횟수: {log.count}회</p>
                        <p className="text-sm text-muted-foreground">사유: {log.reason}</p>
                        <p className="text-sm text-muted-foreground">상태: {log.status}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleViewDetails(log.id)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleToggleUserStatus(log.id)}>
                        비활성화
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnomalyDetection;

