import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Legend,
} from "recharts";
//dd
const AnomalyDetection = () => {
  const [selectedTab, setSelectedTab] = useState("spam-detection");
  const [reportLogs, setReportLogs] = useState([]);
  const [spamData, setSpamData] = useState([]);

  useEffect(() => {
    fetchReports();
    fetchSpamStats();
  }, []);

  const fetchReports = () => {
    axios.get("/api/admin/reports")
      .then(res => setReportLogs(res.data))
      .catch(err => console.error("신고 목록 로딩 실패", err));
  };

  const fetchSpamStats = () => {
    axios.get("/api/admin/spam-stats")
      .then(res => {
        const rawData = Array.isArray(res.data) ? res.data : [];
        const top3SpamMessages = rawData
          .sort((a, b) => b.count - a.count)
          .slice(0, 3)
          .map(item => ({
            ...item,
            label: item.message.length > 12 ? item.message.slice(0, 12) + "..." : item.message,
            tooltipLabel: `[${item.time?.split("T")[1]?.slice(0,5) || "--:--"}] ${item.message}`
          }));
        setSpamData(top3SpamMessages);
      })
      .catch(err => {
        console.error("❌ 스팸 통계 로딩 실패", err);
      });
  };

  const handleToggleUserStatus = async (id, isBanned) => {
    try {
      const url = isBanned ? `/api/admin/unban/${id}` : `/api/admin/ban/${id}`;
      await axios.post(url);
      fetchReports();
    } catch (error) {
      console.error(`${isBanned ? "해제" : "비활성화"} 요청 실패`, error);
    }
  };

  const handleViewDetails = (id) => {
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
        .sort((a, b) => b.reportCount - a.reportCount)
        .map(item => [item.targetUserId, item])
    ).values()
  )
    .sort((a, b) => b.reportCount - a.reportCount)
    .slice(0, 3)
    .map(user => ({
      name: user.targetNickname,
      value: user.reportCount,
    }));

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
            <div className="w-full h-[300px]">{/* 추후 추가 */}</div>
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
                <Tooltip formatter={(value) => `${value}회`} />
                <Bar dataKey="value" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ban className="w-5 h-5 text-admin-danger" />
              반복 메시지 Top 3
            </CardTitle>
          </CardHeader>
          <CardContent>
            {spamData.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">📭 스팸 통계 데이터가 없습니다.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={spamData} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    interval={0}
                    tick={{ fontSize: 12 }}
                    height={50}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip
                    formatter={(value) => [`${value}회`, "반복 횟수"]}
                    labelFormatter={(_, payload) =>
                      `메시지: ${payload?.[0]?.payload?.tooltipLabel || "N/A"}`
                    }
                  />
                  <Legend />
                  <Bar dataKey="count" fill="#f59e0b" name="반복 메시지 수" />
                </BarChart>
              </ResponsiveContainer>
            )}
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
