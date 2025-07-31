import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, MessageSquare, Search, Ban, Eye, Info } from "lucide-react";
import {
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
  const [reportLogs, setReportLogs] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = () => {
    axios.get("/api/admin/reports")
      .then(res => setReportLogs(res.data))
      .catch(err => console.error("신고 목록 로딩 실패", err));
  };

  const handleToggleUserStatus = async (id: number, isBanned: boolean) => {
    try {
      const url = isBanned ? `/api/admin/unban/${id}` : `/api/admin/ban/${id}`;
      await axios.post(url);
      fetchReports(); // 상태 갱신
    } catch (error) {
      console.error(`${isBanned ? "해제" : "비활성화"} 요청 실패`, error);
    }
  };

  const handleViewDetails = (id: number) => {
    console.log(`상세 보기 - ID: ${id}`);
  };

  const topReportedUsers = Array.from(
    new Map(
      reportLogs
        .map(log => ({
          targetUserId: log.targetUserId,
          targetNickname: log.targetNickname ?? `ID:${log.targetUserId}`,
          reportCount: log.reportCount,
        }))
        // 중복 제거 (같은 targetUserId는 마지막 값으로 유지됨)
        .sort((a, b) => b.reportCount - a.reportCount)
        .map(item => [item.targetUserId, item]) // Map: key=userId, value=item
    ).values()
  )
    .sort((a, b) => b.reportCount - a.reportCount) // 다시 정렬 (Map은 순서 유지 안 됨)
    .slice(0, 3) // 🔥 Top 3만
    .map(user => ({
      name: user.targetNickname,
      value: user.reportCount,
    }));

  const offensiveTopWords = [
    { name: "XX놈", value: 120, color: "#ef4444" },
    { name: "꺼져", value: 95, color: "#f97316" },
    { name: "ㅅㅂ", value: 80, color: "#eab308" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
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
          </CardContent>
        </Card>

        <Card>
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

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="spam-detection">
            <Search className="h-4 w-4" />
            스팸/반복 활동
          </TabsTrigger>
          <TabsTrigger value="offensive-words">
            <Info className="h-4 w-4" />
            신고 내용 확인
          </TabsTrigger>
        </TabsList>

        <TabsContent value="offensive-words" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>신고 내용 상세</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportLogs.map((log, index) => (
                  <div key={log.reportId || `${log.targetUserId}-${index}`} className="flex items-center justify-between p-4 border rounded-md">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-admin-warning/10 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-admin-warning" />
                      </div>
                      <div>
                        <h3 className="font-medium">{log.targetNickname ?? '익명'}</h3>
                        <p className="text-sm text-muted-foreground">신고 대상 ID: {log.targetUserId}</p>
                        <p className="text-sm text-muted-foreground">신고자: {log.reporterNickname}</p>
                        <p className="text-sm text-muted-foreground">사유: {log.reason}</p>
                        <p className="text-sm text-muted-foreground">신고 횟수: {log.reportCount}회</p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Button size="sm" variant="ghost" onClick={() => handleViewDetails(log.reportId)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={log.targetBanned ? "outline" : "destructive"}
                        onClick={() => handleToggleUserStatus(log.targetUserId, log.targetBanned)}
                      >
                        {log.targetBanned ? "해제" : "비활성화"}
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
