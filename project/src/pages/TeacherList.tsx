import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, Star, Users, ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";

const subjectData = {
  "korean-history": {
    name: "한국사",
    icon: "📚",
    teachers: [
      {
        id: "teacher1",
        name: "김역사",
        introduction: "서울대 한국사 전공, 10년 경력의 한국사 전문가",
        rating: 4.9,
        students: 156,
        experience: "10년",
        specialties: ["조선시대", "근현대사", "수능한국사"],
        status: "온라인"
      },
      {
        id: "teacher2", 
        name: "이선생",
        introduction: "연세대 사학과 졸업, 한국사능력검정시험 1급",
        rating: 4.8,
        students: 89,
        experience: "7년",
        specialties: ["고대사", "고려시대", "문화사"],
        status: "온라인"
      },
      {
        id: "teacher3",
        name: "박교수",
        introduction: "현직 고등학교 한국사 교사, 교육부 우수교사",
        rating: 4.7,
        students: 203,
        experience: "15년",
        specialties: ["전근대사", "한국사능력검정", "내신대비"],
        status: "온라인"
      }
    ]
  },
  "korean": {
    name: "국어",
    icon: "✏️", 
    teachers: [
      {
        id: "teacher4",
        name: "최국어",
        introduction: "고려대 국어국문학과 졸업, 현직 입시 강사",
        rating: 4.9,
        students: 234,
        experience: "12년",
        specialties: ["문법", "독해", "수능국어"],
        status: "온라인"
      },
      {
        id: "teacher5",
        name: "정선생",
        introduction: "서강대 국문과 석사, 문학 전문가",
        rating: 4.6,
        students: 78,
        experience: "8년", 
        specialties: ["현대문학", "고전문학", "화법과작문"],
        status: "온라인"
      }
    ]
  },
  "english": {
    name: "영어",
    icon: "🌍",
    teachers: [
      {
        id: "teacher6",
        name: "Smith",
        introduction: "미국 출신 원어민 강사, TESOL 자격증 보유",
        rating: 4.8,
        students: 145,
        experience: "9년",
        specialties: ["회화", "발음", "TOEIC"],
        status: "온라인"
      },
      {
        id: "teacher7",
        name: "김영어",
        introduction: "영국 옥스포드대 졸업, 동시통역사 출신",
        rating: 4.9,
        students: 298,
        experience: "18년",
        specialties: ["수능영어", "문법", "독해"],
        status: "온라인"
      },
      {
        id: "teacher8",
        name: "Johnson",
        introduction: "캐나다 출신, 한국 거주 15년 베테랑 강사",
        rating: 4.7,
        students: 167,
        experience: "15년",
        specialties: ["비즈니스영어", "IELTS", "회화"],
        status: "온라인"
      }
    ]
  }
};

const TeacherList = () => {
  const { subject } = useParams<{ subject: string }>();
  const navigate = useNavigate();
  
  const subjectInfo = subject ? subjectData[subject as keyof typeof subjectData] : null;

  if (!subjectInfo) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground">과목을 찾을 수 없습니다</h1>
          <Button onClick={() => navigate("/matching")} className="mt-4">
            과목 선택으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const handleMatching = (teacherId: string) => {
    navigate(`/chat/${teacherId}`);
  };

  return (
   <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/matching")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            뒤로가기
          </Button>
        </div>

        <div className="text-center mb-12">
          <div className="text-6xl mb-4">{subjectInfo.icon}</div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {subjectInfo.name} 멘토
          </h1>
          <p className="text-xl text-muted-foreground">
            현재 온라인 상태인 {subjectInfo.name} 전문 멘토들입니다
          </p>
          <div className="mt-4">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              {subjectInfo.teachers.length}명 온라인
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjectInfo.teachers.map((teacher) => (
            <Card key={teacher.id} className="group hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-primary to-primary-glow text-white">
                        {teacher.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
                
                <CardTitle className="text-xl font-bold">{teacher.name}</CardTitle>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {teacher.introduction}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{teacher.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{teacher.students}명 학습완료</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>경력 {teacher.experience}</span>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">전문 분야</p>
                  <div className="flex flex-wrap gap-1">
                    {teacher.specialties.map((specialty, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={() => handleMatching(teacher.id)}
                  className="w-full mt-4"
                  variant="hero"
                >
                  💬 매칭하기
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-muted/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-3">🔥 실시간 매칭 시스템</h3>
            <p className="text-sm text-muted-foreground">
              모든 멘토는 현재 온라인 상태이며, 매칭 즉시 1대1 대화를 시작할 수 있습니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherList;