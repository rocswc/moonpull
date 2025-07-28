import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserCheck, FileCheck, Search, Eye } from "lucide-react";

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const users = [
    { id: 1, name: "김민수", email: "minsu@example.com", role: "멘티", status: "활성", joinDate: "2024-01-15" },
    { id: 2, name: "이영희", email: "younghee@example.com", role: "멘토", status: "활성", joinDate: "2024-02-20" },
    { id: 3, name: "박준호", email: "junho@example.com", role: "멘티", status: "비활성", joinDate: "2024-03-10" },
    { id: 4, name: "최수정", email: "sujung@example.com", role: "관리자", status: "활성", joinDate: "2024-01-05" },
  ];

  const certificationRequests = [
    { id: 1, name: "강태영", subject: "수학", university: "서울대학교", experience: "5년", status: "대기중", submittedDate: "2024-07-20" },
    { id: 2, name: "정하림", subject: "영어", university: "연세대학교", experience: "3년", status: "대기중", submittedDate: "2024-07-19" },
  ];

  const handleGrantMentor = (userId: number) => {
    alert(`사용자 ${userId}에게 멘토 권한을 부여했습니다.`);
  };

  const handleRevokeMentor = (userId: number) => {
    alert(`사용자 ${userId}의 멘토 권한을 철회했습니다.`);
  };

  const handleApproveCertification = (requestId: number) => {
    alert(`인증 요청 ${requestId}을 승인했습니다.`);
  };

  const handleDenyCertification = (requestId: number) => {
    alert(`인증 요청 ${requestId}을 거부했습니다.`);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-admin rounded-2xl flex items-center justify-center shadow-glow">
            <Users className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">사용자 관리</h1>
        </div>
        <p className="text-lg text-muted-foreground">사용자 계정과 권한을 관리하세요</p>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/50">
          <TabsTrigger value="users" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Users className="h-4 w-4" />
            사용자 목록
          </TabsTrigger>
          <TabsTrigger value="certifications" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <FileCheck className="h-4 w-4" />
            멘토 인증 요청
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <Card className="shadow-elegant bg-gradient-card border border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>전체 사용자</span>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="사용자 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/30">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">{user.name[0]}</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={user.role === "멘토" ? "default" : user.role === "관리자" ? "destructive" : "secondary"}>
                        {user.role}
                      </Badge>
                      <Badge variant={user.status === "활성" ? "default" : "secondary"}>
                        {user.status}
                      </Badge>
                      <div className="flex gap-2">
                        {user.role === "멘티" && (
                          <Button size="sm" variant="success" onClick={() => handleGrantMentor(user.id)}>
                            <UserCheck className="w-4 h-4 mr-1" />
                            멘토 권한 부여
                          </Button>
                        )}
                        {user.role === "멘토" && (
                          <Button size="sm" variant="warning" onClick={() => handleRevokeMentor(user.id)}>
                            멘토 권한 철회
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certifications" className="mt-6">
          <Card className="shadow-elegant bg-gradient-card border border-border/50">
            <CardHeader>
              <CardTitle>멘토 인증 요청</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {certificationRequests.map((request) => (
                  <div key={request.id} className="p-4 bg-background/50 rounded-lg border border-border/30">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-foreground">{request.name}</h3>
                        <p className="text-sm text-muted-foreground">{request.subject} • {request.university}</p>
                      </div>
                      <Badge variant="secondary">{request.status}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">전공</p>
                        <p className="font-medium">{request.subject}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">경력</p>
                        <p className="font-medium">{request.experience}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">신청일</p>
                        <p className="font-medium">{request.submittedDate}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4 mr-1" />
                        서류 보기
                      </Button>
                      <Button size="sm" variant="success" onClick={() => handleApproveCertification(request.id)}>
                        승인
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDenyCertification(request.id)}>
                        거부
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

export default UserManagement;