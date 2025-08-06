import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axiosConfig";
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

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const AnomalyDetection = () => {
  const [selectedTab, setSelectedTab] = useState("spam-detection");
  const [reportLogs, setReportLogs] = useState([]);
  const [spamData, setSpamData] = useState([]);

  useEffect(() => {
    fetchReports();
    fetchSpamStats();
  }, []);

  const fetchReports = () => {
    const token = localStorage.getItem("token");
    const config = {
      withCredentials: true,
      headers: {},
    };

    if (token && token !== "null" && token !== "undefined") {
      config.headers.Authorization = `Bearer ${token}`;
    }

    axiosInstance.get("/api/admin/reports", config)
      .then(res => {
        const normalizedData = res.data.map(log => ({
          ...log,
          targetBanned: Boolean(log.targetBanned), // 숫자 → boolean 변환
        }));

        setReportLogs(normalizedData);
      })
      .catch(err => console.error("❌ 신고 목록 로딩 실패", err));
  };

  const fetchSpamStats = () => {
    axiosInstance.get("/api/admin/spam-stats")
      .then(res => {
        const rawData = Array.isArray(res.data) ? res.data : [];
        const top3SpamMessages = rawData
          .sort((a, b) => (b?.count || 0) - (a?.count || 0))
          .slice(0, 3)
          .map(item => {
            let timeMs = null;

            if (typeof item.time === "string" && item.time.includes("T")) {
              const parsed = dayjs(item.time);
              if (parsed.isValid()) timeMs = parsed.valueOf();
            } else {
              const rawTime = Number(item.time);
              if (!isNaN(rawTime) && rawTime > 0) {
                timeMs = rawTime > 1e12 ? rawTime : rawTime * 1000;
              }
            }

            console.log("item.time:", item.time, "timeMs:", timeMs);

            return {
              ...item,
              label: item?.message?.length > 12
                ? item.message.slice(0, 12) + "..."
                : item?.message || "(내용 없음)",
              tooltipLabel: timeMs
                ? `[${dayjs(timeMs).tz("Asia/Seoul").format("HH:mm")}] ${item.message || "(내용 없음)"}`
                : `--:-- ${item.message || "(내용 없음)"}`,
              _timeMs: timeMs,
            };
          });
        setSpamData(top3SpamMessages);
      })
      .catch(err => console.error("❌ 스팸 통계 로딩 실패", err));
  };

  const handleToggleUserStatusByLoginId = async (loginId, isBanned) => {
    if (!loginId) return;
    try {
      const url = isBanned ? `/api/admin/unban/login/${loginId}` : `/api/admin/ban/login/${loginId}`;
      await axiosInstance.post(url);
      setTimeout(() => fetchReports(), 300);
    } catch (error) {
      console.error(`${isBanned ? "해제" : "비활성화"} 요청 실패 (loginId)`, error);
    }
  };

  const handleToggleUserStatus = async (reportId: number, isBanned: boolean) => {
    if (!reportId) return;
    try {
      const url = isBanned ? `/api/admin/unban/${reportId}` : `/api/admin/ban/${reportId}`;
      await axiosInstance.post(url);
      await fetchReports();
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
          targetUserId: log?.targetUserId ?? "null",
          targetNickname: log?.targetNickname ?? `ID:${log?.targetUserId ?? "null"}`,
          reportCount: log?.reportCount ?? 0,
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
                <Tooltip formatter={value => `${value}회`} />
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
                  <XAxis dataKey="label" interval={0} tick={{ fontSize: 12 }} height={50} />
                  <YAxis allowDecimals={false} />
                  <Tooltip
                    formatter={value => [`${value}회`, "반복 횟수"]}
                    labelFormatter={(_, payload) => `메시지: ${payload?.[0]?.payload?.tooltipLabel || "N/A"}`}
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

        <TabsContent value="spam-detection" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>반복 메시지 상세</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {spamData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-md">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Ban className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">보낸 사람: {item.sender ?? "익명"}</h3>
                        <p className="text-sm text-muted-foreground">
                          시간: {item._timeMs !== null ? dayjs(item._timeMs).tz("Asia/Seoul").format("HH:mm") : `--:-- (원본: ${item.time ?? "없음"})`}
                        </p>
                        <p className="text-sm text-muted-foreground">메시지: {item.message ?? "(메시지 없음)"}</p>
                        <p className="text-sm text-muted-foreground">반복 횟수: {item.count ?? 0}회</p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Button
                        size="sm"
                        variant={item.isBanned ? "outline" : "destructive"}
                        onClick={() => handleToggleUserStatusByLoginId(item.sender ?? "", item.targetBanned ?? false)}
                      >
                        {item.isBanned ? "해제" : "비활성화"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offensive-words" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>신고 내용 상세</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportLogs.map((log, index) => (
                  <div
                    key={log.reportId || `${log.targetUserId}-${index}`}
                    className="flex items-center justify-between p-4 border rounded-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-admin-warning/10 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-admin-warning" />
                      </div>
                      <div>
                        <h3 className="font-medium">{log.targetNickname ?? "익명"}</h3>
                        <p className="text-sm text-muted-foreground">신고 대상 ID: {log.targetUserId ?? "(없음)"}</p>
                        <p className="text-sm text-muted-foreground">신고자: {log.reporterNickname ?? "알 수 없음"}</p>
                        <p className="text-sm text-muted-foreground">사유: {log.reason ?? "사유 없음"}</p>
                        <p className="text-sm text-muted-foreground">신고 횟수: {log.reportCount ?? 0}회</p>
                        <p className="text-sm text-muted-foreground">
                          시간: {log.createdAt ? dayjs(log.createdAt).tz("Asia/Seoul").format("HH:mm:ss") : "--:--"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Button size="sm" variant="ghost" onClick={() => handleViewDetails(log.reportId)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={log.targetBanned ? "outline" : "destructive"}
                        onClick={() => handleToggleUserStatus(log.reportId ?? 0, log.targetBanned ?? false)}
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
