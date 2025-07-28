import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import Navigation from "@/components/Navigation";

const subjects = [
  {
    id: "korean-history",
    name: "한국사",
    description: "조선시대부터 현대사까지 체계적인 한국사 학습",
    icon: "📚",
    color: "from-primary to-primary-glow",
    onlineTeachers: 12
  },
  {
    id: "korean",
    name: "국어",
    description: "문법, 독해, 작문까지 국어 실력 향상",
    icon: "✏️",
    color: "from-pink-500 to-rose-500",
    onlineTeachers: 8
  },
  {
    id: "english",
    name: "영어",
    description: "회화, 문법, 독해 등 영어 실력 완성",
    icon: "🌍",
    color: "from-blue-500 to-cyan-500",
    onlineTeachers: 15
  }
];

const Matching = () => {
  const navigate = useNavigate();

  const handleSubjectSelect = (subjectId: string) => {
    navigate(`/matching/${subjectId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
      <Navigation />

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            멘토 매칭 서비스
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            원하는 과목을 선택하세요
          </p>
          <p className="text-muted-foreground">
            실시간으로 접속한 전문 멘토들과 1대1 매칭됩니다
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {subjects.map((subject) => (
            <Card
              key={subject.id}
              className="flex flex-col justify-between group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/20"
              onClick={() => handleSubjectSelect(subject.id)}
            >
              <CardHeader className="text-center pb-4">
                <div
                  className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${subject.color} flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300`}
                >
                  {subject.icon}
                </div>
                <CardTitle className="text-2xl font-bold">
                  {subject.name}
                </CardTitle>
                <CardDescription className="text-base">
                  {subject.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="text-center mt-auto pt-0">
                <div className="mb-6">
                  <span className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    온라인 멘토 {subject.onlineTeachers}명
                  </span>
                </div>

                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSubjectSelect(subject.id);
                  }}
                >
                  멘토 찾기
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-muted/50 rounded-xl p-8">
            <h3 className="text-xl font-semibold mb-4">💡 매칭 방법</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-muted-foreground">
              <div>
                <div className="text-2xl mb-2">1️⃣</div>
                <p>원하는 과목 선택</p>
              </div>
              <div>
                <div className="text-2xl mb-2">2️⃣</div>
                <p>실시간 온라인 멘토 확인</p>
              </div>
              <div>
                <div className="text-2xl mb-2">3️⃣</div>
                <p>매칭 후 즉시 1대1 대화</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Matching;
