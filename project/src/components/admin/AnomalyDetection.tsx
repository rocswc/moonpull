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

type ReportLog = {
  reportId: number;
  reporterId: number;
  targetUserId: number | null;
  reason?: string;
  status?: string;
  createdAt?: string;
  reporterNickname?: string;
  targetNickname?: string;
  targetBanned?: boolean | number;
  reportCount?: number;
};

type TopUser = {
  targetUserId: number;
  targetNickname: string;
  reportCount: number;
  targetBanned?: boolean | number;
};

const AnomalyDetection = () => {
  const [selectedTab, setSelectedTab] = useState("spam-detection");
  const [reportLogs, setReportLogs] = useState<ReportLog[]>([]);
  const [spamData, setSpamData] = useState<any[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);

  useEffect(() => {
    fetchReports();
    fetchSpamStats();
    fetchTopReportedUsers();
  }, []);

  const withAuth = () => {
    const token = localStorage.getItem("token");
    const config: any = { withCredentials: true, headers: {} as Record<string, string> };
    if (token && token !== "null" && token !== "undefined") {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  };

  const fetchReports = () => {
    axiosInstance
      .get("/api/admin/reports", withAuth())
      .then((res) => {
        const normalizedData: ReportLog[] = (res.data || []).map((log: any) => ({
          ...log,
          targetBanned: Boolean(log.targetBanned),
        }));
        setReportLogs(normalizedData);
      })
      .catch((err) => console.error("❌ 신고 목록 로딩 실패", err));
  };

  const fetchTopReportedUsers = () => {
    console.log("▶ fetchTopReportedUsers() 호출");
    axiosInstance
      .get("/api/admin/reports/top", withAuth()) // 쿠키 전송만 보장
      .then((res) => {
        console.log("◀ /api/admin/reports/top", res.status, res.data);
        setTopUsers((res.data || []).map((u: any) => ({
          ...u,
          targetBanned: Boolean(u.targetBanned),
        })));
      })
      .catch((err) => {
        console.error("✗ /api/admin/reports/top",
          err.response?.status, err.response?.data || err.message);
      });
  };


  const fetchSpamStats = () => {
    axiosInstance
      .get("/api/admin/spam-stats", withAuth())
      .then((res) => {
        const rawData = Array.isArray(res.data) ? res.data : [];
        const top3SpamMessages = rawData
          .sort((a, b) => (b?.count || 0) - (a?.count || 0))
          .slice(0, 3)
          .map((item) => {
            let timeMs: number | null = null;

            if (typeof item.time === "string" && item.time.includes("T")) {
              const parsed = dayjs(item.time);
              if (parsed.isValid()) timeMs = parsed.valueOf();
            } else {
              const rawTime = Number(item.time);
              if (!isNaN(rawTime) && rawTime > 0) {
                timeMs = rawTime > 1e12 ? rawTime : rawTime * 1000;
              }
            }

            return {
              ...item,
              label:
                item?.message?.length > 12
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
      .catch((err) => console.error("❌ 스팸 통계 로딩 실패", err));
  };

  const handleToggleUserStatus = async (reportId: number, isBanned: boolean) => {
    if (!reportId) return;
    try {
      const url = isBanned ? `/api/admin/unban/${reportId}` : `/api/admin/ban/${reportId}`;
      await axiosInstance.post(url, null, withAuth());
      await fetchReports();
      await fetchTopReportedUsers();
    } catch (error) {
      console.error(`${isBanned ? "해제" : "비활성화"} 요청 실패`, error);
    }
  };

  const handleToggleUserStatusByLoginId = async (loginId: string, isBanned: boolean) => {
    if (!loginId) return;
    try {
      const url = isBanned ? `/api/admin/unban/login/${loginId}` : `/api/admin/ban/login/${loginId}`;
      await axiosInstance.post(url, null, withAuth());
      setTimeout(() => {
        fetchReports();
        fetchTopReportedUsers();
      }, 300);
    } catch (error) {
      console.error(`${isBanned ? "해제" : "비활성화"} 요청 실패 (loginId)`, error);
    }
  };

  const handleViewDetails = (id?: number) => {
    console.log("🔴 상세 보기 - ID:", id);
  };

  // ✅ 서버 Top3로 바로 차트 구성
  const topReportedUsersChart = topUsers.map((u) => ({
    name: u.targetNickname ?? `ID:${u.targetUserId}`,
    value: u.reportCount ?? 0,
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
              <BarChart data={topReportedUsersChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: any) => `${value}회`} />
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
                    formatter={(value: any) => [`${value}회`, "반복 횟수"]}
                    labelFormatter={(_, payload: any) =>
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
                          시간:{" "}
                          {item._timeMs !== null
                            ? dayjs(item._timeMs).tz("Asia/Seoul").format("HH:mm")
                            : `--:-- (원본: ${item.time ?? "없음"})`}
                        </p>
                        <p className="text-sm text-muted-foreground">메시지: {item.message ?? "(메시지 없음)"}</p>
                        <p className="text-sm text-muted-foreground">반복 횟수: {item.count ?? 0}회</p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Button
                        size="sm"
                        variant={item.targetBanned ? "outline" : "destructive"}
                        onClick={() =>
                          handleToggleUserStatusByLoginId(String(item.sender ?? ""), Boolean(item.targetBanned))
                        }
                      >
                        {item.targetBanned ? "해제" : "비활성화"}
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
                        <p className="text-sm text-muted-foreground">
                          신고 대상 ID: {log.targetLoginId ?? "(없음)"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          신고자: {log.reporterNickname ?? "알 수 없음"}
                        </p>
                        <p className="text-sm text-muted-foreground">사유: {log.reason ?? "사유 없음"}</p>
                        <p className="text-sm text-muted-foreground">신고 횟수: {log.reportCount ?? 0}회</p>
                        <p className="text-sm text-muted-foreground">
                          시간:{" "}
                          {log.createdAt
                            ? dayjs(log.createdAt).tz("Asia/Seoul").format("HH:mm:ss")
                            : "--:--"}
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
                        onClick={() =>
                          handleToggleUserStatus(Number(log.reportId ?? 0), Boolean(log.targetBanned))
                        }
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
