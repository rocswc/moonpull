import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Target, Zap, RefreshCw, PlayCircle } from "lucide-react";
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
} from "recharts";

const MLPerformance = () => {
  // RIMA Model Data
  const rimaAccuracy = [
    { date: "7/1", accuracy: 87.2, precision: 89.1, recall: 85.3 },
    { date: "7/5", accuracy: 88.5, precision: 90.2, recall: 86.8 },
    { date: "7/10", accuracy: 89.1, precision: 91.0, recall: 87.2 },
    { date: "7/15", accuracy: 90.3, precision: 92.1, recall: 88.5 },
    { date: "7/20", accuracy: 91.7, precision: 93.2, recall: 90.1 },
  ];

  // GEMA Model Data
  const gemaAccuracy = [
    { date: "7/1", accuracy: 92.1, precision: 93.5, recall: 90.7 },
    { date: "7/5", accuracy: 92.8, precision: 94.1, recall: 91.5 },
    { date: "7/10", accuracy: 93.2, precision: 94.6, recall: 91.8 },
    { date: "7/15", accuracy: 93.9, precision: 95.1, recall: 92.7 },
    { date: "7/20", accuracy: 94.5, precision: 95.8, recall: 93.2 },
  ];

  // Recommendation Quality
  const recommendationQuality = [
    { metric: "관련성", score: 92 },
    { metric: "다양성", score: 85 },
    { metric: "참신성", score: 78 },
    { metric: "정확성", score: 94 },
    { metric: "사용자 만족도", score: 88 },
  ];

  // Model Performance Comparison
  const modelComparison = [
    { model: "RIMA v2.1", accuracy: 91.7, speed: 145, memory: 2.3 },
    { model: "GEMA v1.8", accuracy: 94.5, speed: 98, memory: 3.1 },
    { model: "Baseline", accuracy: 76.2, speed: 220, memory: 1.2 },
  ];

  // Training Progress
  const trainingProgress = [
    { epoch: 1, loss: 0.45, validation: 0.52 },
    { epoch: 5, loss: 0.32, validation: 0.38 },
    { epoch: 10, loss: 0.24, validation: 0.29 },
    { epoch: 15, loss: 0.18, validation: 0.23 },
    { epoch: 20, loss: 0.14, validation: 0.19 },
    { epoch: 25, loss: 0.11, validation: 0.16 },
  ];

  const handleRetrainModel = (model: string) => {
    if (confirm(`${model} 모델을 재학습시키겠습니까? 이 작업은 약 2-3시간 소요됩니다.`)) {
      alert(`${model} 모델 재학습이 시작되었습니다.`);
    }
  };

  const handleModelDeploy = (model: string) => {
    if (confirm(`${model} 모델을 프로덕션에 배포하시겠습니까?`)) {
      alert(`${model} 모델이 성공적으로 배포되었습니다.`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-admin rounded-2xl flex items-center justify-center shadow-glow">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">ML 성능 대시보드</h1>
        </div>
        <p className="text-lg text-muted-foreground">머신러닝 모델의 성능을 실시간으로 모니터링하세요</p>
      </div>

      {/* Model Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-card bg-gradient-card border border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-admin-primary/10 rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-admin-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">RIMA 모델</p>
                <p className="text-2xl font-bold text-foreground">91.7%</p>
                <Badge variant="default" className="mt-1">운영중</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-admin-secondary/10 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-admin-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">GEMA 모델</p>
                <p className="text-2xl font-bold text-foreground">94.5%</p>
                <Badge variant="default" className="mt-1">운영중</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-admin-success/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-admin-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">추천 품질</p>
                <p className="text-2xl font-bold text-foreground">87.4%</p>
                <Badge variant="default" className="mt-1">우수</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RIMA Model Trends */}
        <Card className="shadow-elegant bg-gradient-card border border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-admin-primary" />
              RIMA 모델 성능 추이
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={rimaAccuracy}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" />
                <YAxis domain={[80, 100]} />
                <Tooltip formatter={(value: number) => `${value}%`} />
                <Line 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="hsl(var(--admin-primary))" 
                  strokeWidth={2}
                  name="정확도"
                />
                <Line 
                  type="monotone" 
                  dataKey="precision" 
                  stroke="hsl(var(--admin-secondary))" 
                  strokeWidth={2}
                  name="정밀도"
                />
                <Line 
                  type="monotone" 
                  dataKey="recall" 
                  stroke="hsl(var(--admin-warning))" 
                  strokeWidth={2}
                  name="재현율"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* GEMA Model Trends */}
        <Card className="shadow-elegant bg-gradient-card border border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-admin-secondary" />
              GEMA 모델 성능 추이
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={gemaAccuracy}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" />
                <YAxis domain={[85, 100]} />
                <Tooltip formatter={(value: number) => `${value}%`} />
                <Area 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="hsl(var(--admin-secondary))" 
                  fill="hsl(var(--admin-secondary) / 0.3)"
                  strokeWidth={2}
                  name="정확도"
                />
                <Area 
                  type="monotone" 
                  dataKey="precision" 
                  stroke="hsl(var(--admin-success))" 
                  fill="hsl(var(--admin-success) / 0.2)"
                  strokeWidth={2}
                  name="정밀도"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommendation Quality Radar */}
        <Card className="shadow-elegant bg-gradient-card border border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-admin-success" />
              개인화 추천 품질 분석
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={recommendationQuality}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="품질 점수"
                  dataKey="score"
                  stroke="hsl(var(--admin-success))"
                  fill="hsl(var(--admin-success) / 0.3)"
                  strokeWidth={2}
                />
                <Tooltip formatter={(value: number) => `${value}점`} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Model Performance Comparison */}
        <Card className="shadow-elegant bg-gradient-card border border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-admin-warning" />
              모델 성능 비교
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={modelComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="model" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="accuracy" fill="hsl(var(--admin-primary))" name="정확도 (%)" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {modelComparison.map((model, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-background/30 rounded">
                  <span className="text-sm font-medium">{model.model}</span>
                  <div className="flex gap-2 text-xs">
                    <span>속도: {model.speed}ms</span>
                    <span>메모리: {model.memory}GB</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Training Progress */}
      <Card className="shadow-elegant bg-gradient-card border border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-admin-primary" />
            최근 학습 진행 상황
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trainingProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="epoch" />
              <YAxis />
              <Tooltip formatter={(value: number) => value.toFixed(3)} />
              <Line 
                type="monotone" 
                dataKey="loss" 
                stroke="hsl(var(--admin-danger))" 
                strokeWidth={2}
                name="훈련 손실"
              />
              <Line 
                type="monotone" 
                dataKey="validation" 
                stroke="hsl(var(--admin-warning))" 
                strokeWidth={2}
                name="검증 손실"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Model Control Panel */}
      <Card className="shadow-elegant bg-gradient-card border border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-admin-primary" />
            모델 제어 패널
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">RIMA 모델 관리</h3>
              <div className="space-y-2">
                <Button variant="admin" className="w-full" onClick={() => handleRetrainModel("RIMA")}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  모델 재학습 시작
                </Button>
                <Button variant="outline" className="w-full" onClick={() => handleModelDeploy("RIMA")}>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  프로덕션 배포
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">GEMA 모델 관리</h3>
              <div className="space-y-2">
                <Button variant="admin" className="w-full" onClick={() => handleRetrainModel("GEMA")}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  모델 재학습 시작
                </Button>
                <Button variant="outline" className="w-full" onClick={() => handleModelDeploy("GEMA")}>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  프로덕션 배포
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-background/30 rounded-lg border border-border/20">
            <p className="text-sm text-muted-foreground text-center">
              💡 모델 재학습은 새로운 데이터를 기반으로 성능을 개선합니다. 
              프로덕션 배포 전에 충분한 검증을 거치세요.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MLPerformance;