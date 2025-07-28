import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, Wifi, Database, Bell, RefreshCw, Zap, Activity, AlertTriangle } from "lucide-react";

const SystemControl = () => {
  const [wsConnections, setWsConnections] = useState(89);
  const [redisStatus, setRedisStatus] = useState("정상");
  const [alerts, setAlerts] = useState([
    { id: 1, message: "새로운 멘토 인증 요청이 있습니다.", type: "info", timestamp: "방금 전" },
  ]);

  const systemMetrics = [
    { name: "CPU 사용률", value: "45%", status: "정상", color: "text-admin-success" },
    { name: "메모리 사용률", value: "67%", status: "정상", color: "text-admin-success" },
    { name: "디스크 사용률", value: "82%", status: "주의", color: "text-admin-warning" },
    { name: "네트워크 대역폭", value: "1.2GB/s", status: "정상", color: "text-admin-success" },
  ];

  const redisMetrics = [
    { key: "사용자 세션", value: "1,247개", status: "정상" },
    { key: "랭킹 데이터", value: "456개", status: "정상" },
    { key: "캐시 히트율", value: "94.5%", status: "우수" },
    { key: "메모리 사용량", value: "2.1GB", status: "정상" },
  ];

  const handleRedisReset = () => {
    if (confirm("정말로 Redis 캐시를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      alert("Redis 캐시가 성공적으로 초기화되었습니다.");
    }
  };

  const handleSystemRestart = (service: string) => {
    if (confirm(`${service} 서비스를 재시작하시겠습니까?`)) {
      alert(`${service} 서비스가 재시작되었습니다.`);
    }
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setWsConnections(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-admin rounded-2xl flex items-center justify-center shadow-glow">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">시스템 제어</h1>
        </div>
        <p className="text-lg text-muted-foreground">시스템 상태를 모니터링하고 제어하세요</p>
      </div>

      {/* Real-time Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <Alert key={alert.id} className="border-admin-primary/20 bg-admin-primary/5">
              <Bell className="h-4 w-4 text-admin-primary" />
              <AlertDescription className="flex justify-between items-center">
                <span>{alert.message}</span>
                <span className="text-sm text-muted-foreground">{alert.timestamp}</span>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemMetrics.map((metric, index) => (
          <Card key={index} className="shadow-card bg-gradient-card border border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-background/50 flex items-center justify-center ${metric.color}`}>
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{metric.name}</p>
                  <p className="text-xl font-bold text-foreground">{metric.value}</p>
                  <Badge variant={metric.status === "정상" ? "default" : "secondary"} className="mt-1">
                    {metric.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WebSocket Monitoring */}
        <Card className="shadow-elegant bg-gradient-card border border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="w-5 h-5 text-admin-secondary" />
              WebSocket 연결 모니터링
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-background/50 rounded-lg border border-border/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">현재 연결 수</span>
                <Badge variant="default" className="animate-pulse-glow">
                  실시간
                </Badge>
              </div>
              <p className="text-3xl font-bold text-admin-secondary">{wsConnections}</p>
              <p className="text-sm text-muted-foreground mt-1">활성 WebSocket 연결</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">채팅 연결</span>
                <span className="text-sm font-medium">{Math.floor(wsConnections * 0.6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">알림 연결</span>
                <span className="text-sm font-medium">{Math.floor(wsConnections * 0.3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">관리자 연결</span>
                <span className="text-sm font-medium">{Math.floor(wsConnections * 0.1)}</span>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              연결 상태 새로고침
            </Button>
          </CardContent>
        </Card>

        {/* Redis Control */}
        <Card className="shadow-elegant bg-gradient-card border border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-admin-warning" />
              Redis 캐시 관리
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-background/50 rounded-lg border border-border/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Redis 상태</span>
                <Badge variant={redisStatus === "정상" ? "default" : "destructive"}>
                  {redisStatus}
                </Badge>
              </div>
              <div className="space-y-2">
                {redisMetrics.map((metric, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-sm">{metric.key}</span>
                    <span className="text-sm font-medium">{metric.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Button variant="warning" className="w-full" onClick={handleRedisReset}>
                <Database className="w-4 h-4 mr-2" />
                Redis 캐시 초기화
              </Button>
              <Button variant="outline" className="w-full" onClick={() => handleSystemRestart("Redis")}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Redis 서비스 재시작
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Control Panel */}
      <Card className="shadow-elegant bg-gradient-card border border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-admin-primary" />
            서비스 제어 패널
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-background/50 rounded-lg border border-border/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-admin-success rounded-full"></div>
                  <span className="font-medium">웹 서버</span>
                </div>
                <Badge variant="default">실행중</Badge>
              </div>
              <Button size="sm" variant="outline" className="w-full" onClick={() => handleSystemRestart("웹 서버")}>
                재시작
              </Button>
            </div>

            <div className="p-4 bg-background/50 rounded-lg border border-border/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-admin-success rounded-full"></div>
                  <span className="font-medium">데이터베이스</span>
                </div>
                <Badge variant="default">실행중</Badge>
              </div>
              <Button size="sm" variant="outline" className="w-full" onClick={() => handleSystemRestart("데이터베이스")}>
                재시작
              </Button>
            </div>

            <div className="p-4 bg-background/50 rounded-lg border border-border/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-admin-warning rounded-full"></div>
                  <span className="font-medium">AI 모델</span>
                </div>
                <Badge variant="secondary">대기중</Badge>
              </div>
              <Button size="sm" variant="outline" className="w-full" onClick={() => handleSystemRestart("AI 모델")}>
                시작
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default SystemControl;