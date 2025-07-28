import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Plus, Edit, Trash2, Eye, Camera, FileText } from "lucide-react";

const ContentManagement = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    subject: "",
    difficulty: "",
  });

  const ocrQuestions = [
    { id: 1, question: "다음 중 한국사의 시대 구분에 대한 설명으로 옳은 것은?", subject: "한국사", difficulty: "중급", status: "검토 대기" },
    { id: 2, question: "이차방정식의 해를 구하는 공식은?", subject: "수학", difficulty: "초급", status: "승인됨" },
    { id: 3, question: "영어의 현재완료형 용법에 대해 설명하시오.", subject: "영어", difficulty: "고급", status: "검토 대기" },
  ];

  const categories = [
    { id: 1, name: "한국사", questionCount: 156, subcategories: ["고대사", "중세사", "근현대사"] },
    { id: 2, name: "수학", questionCount: 234, subcategories: ["대수", "기하", "확률과 통계"] },
    { id: 3, name: "영어", questionCount: 189, subcategories: ["문법", "독해", "어휘"] },
    { id: 4, name: "과학", questionCount: 98, subcategories: ["물리", "화학", "생물"] },
  ];

  const handleQuestionSubmit = () => {
    if (!newQuestion.question.trim() || !newQuestion.subject) {
      alert("필수 정보를 모두 입력해주세요.");
      return;
    }
    alert("문제가 성공적으로 등록되었습니다.");
    setNewQuestion({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      subject: "",
      difficulty: "",
    });
  };

  const handleDeleteCategory = (categoryId: number) => {
    if (confirm("정말로 이 카테고리를 삭제하시겠습니까?")) {
      alert(`카테고리 ${categoryId}가 삭제되었습니다.`);
    }
  };

  const handleApproveQuestion = (questionId: number) => {
    alert(`문제 ${questionId}를 승인했습니다.`);
  };

  const handleRejectQuestion = (questionId: number) => {
    alert(`문제 ${questionId}를 거부했습니다.`);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-admin rounded-2xl flex items-center justify-center shadow-glow">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">콘텐츠 관리</h1>
        </div>
        <p className="text-lg text-muted-foreground">문제와 카테고리를 체계적으로 관리하세요</p>
      </div>

      <Tabs defaultValue="manual-register" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/50">
          <TabsTrigger value="manual-register" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Plus className="h-4 w-4" />
            문제 수동 등록
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <BookOpen className="h-4 w-4" />
            카테고리 관리
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual-register" className="mt-6">
          <Card className="shadow-elegant bg-gradient-card border border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-admin-success" />
                문제 수동 등록
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">과목/카테고리</label>
                  <Select value={newQuestion.subject} onValueChange={(value) => setNewQuestion({...newQuestion, subject: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="과목을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="korean-history">한국사</SelectItem>
                      <SelectItem value="math">수학</SelectItem>
                      <SelectItem value="english">영어</SelectItem>
                      <SelectItem value="science">과학</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">난이도</label>
                  <Select value={newQuestion.difficulty} onValueChange={(value) => setNewQuestion({...newQuestion, difficulty: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="난이도를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">초급</SelectItem>
                      <SelectItem value="medium">중급</SelectItem>
                      <SelectItem value="hard">고급</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">문제</label>
                <Textarea
                  placeholder="문제를 입력하세요..."
                  value={newQuestion.question}
                  onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">선택지</label>
                <div className="space-y-2">
                  {newQuestion.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`선택지 ${index + 1}`}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...newQuestion.options];
                          newOptions[index] = e.target.value;
                          setNewQuestion({...newQuestion, options: newOptions});
                        }}
                      />
                      <Button
                        variant={newQuestion.correctAnswer === index ? "success" : "outline"}
                        size="sm"
                        onClick={() => setNewQuestion({...newQuestion, correctAnswer: index})}
                      >
                        정답
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleQuestionSubmit} className="w-full" variant="admin">
                문제 등록
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-elegant bg-gradient-card border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-admin-warning" />
                    카테고리 목록
                  </span>
                  <Button size="sm" variant="admin">
                    <Plus className="w-4 h-4 mr-1" />
                    새 카테고리
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.map((category) => (
                    <div key={category.id} className="p-4 bg-background/50 rounded-lg border border-border/30">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-foreground">{category.name}</h3>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteCategory(category.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{category.questionCount}개 문제</p>
                      <div className="flex flex-wrap gap-1">
                        {category.subcategories.map((sub, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {sub}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-elegant bg-gradient-card border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-admin-success" />
                  새 카테고리 추가
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">카테고리 이름</label>
                  <Input placeholder="카테고리 이름을 입력하세요" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">설명</label>
                  <Textarea placeholder="카테고리 설명을 입력하세요" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">하위 카테고리</label>
                  <Input placeholder="하위 카테고리를 쉼표로 구분하여 입력" />
                </div>
                <Button variant="admin" className="w-full">
                  카테고리 추가
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentManagement;