// ✅ 전체 TeacherList.tsx (생략 없이 전체입니다)
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, Star, Users, ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";

type Teacher = {
  id: string | number;
  userId: number; // ✅ 백엔드에서 userId로 매칭
  name: string;
  introduction: string;
  rating: number;
  students: number;
  experience: string;
  specialties: string[];
  status: string;
};

const subjectMap: Record<string, { name: string; icon: string }> = {
  "korean-history": { name: "한국사", icon: "📚" },
  "korean": { name: "국어", icon: "✏️" },
  "english": { name: "영어", icon: "🌍" },
};

const TeacherList = () => {
  const { subject } = useParams<{ subject: string }>();
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  const subjectInfo = subject ? subjectMap[subject] : null;

  useEffect(() => {
    if (!subject) return;

    const fetchTeachers = async () => {
      try {
        const res = await axios.get(`/api/mentors/${subject}`, {
          withCredentials: true,
        });
        setTeachers(res.data);
      } catch (error) {
        console.error("멘토 정보를 불러오지 못했습니다.", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, [subject]);

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

  const handleMatching = (userId: number) => {
    navigate(`/chat/${userId}`); // ✅ userId로 이동
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
      <Navigation />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/matching")} className="gap-2">
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
              {teachers.length}명 온라인
            </Badge>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground">불러오는 중...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map((teacher) => (
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
                  <p className="text-sm text-muted-foreground leading-relaxed">{teacher.introduction}</p>
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
                    onClick={() => handleMatching(teacher.userId)}
                    className="w-full mt-4"
                    variant="hero"
                  >
                    💬 매칭하기
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherList;
