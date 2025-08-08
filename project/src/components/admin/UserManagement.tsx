import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, FileCheck, Search, Eye } from "lucide-react";
import BanModal from "@/components/BanModal";

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [certificationRequests, setCertificationRequests] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [banModalOpen, setBanModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchMentorRequests();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/api/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error("사용자 목록 로드 실패", err);
    }
  };

  const fetchMentorRequests = async () => {
    try {
      const res = await axios.get("/api/admin/mentor-requests");
      setCertificationRequests(res.data);
    } catch (err) {
      console.error("멘토 요청 로드 실패", err);
    }
  };

  const handleGrantMentor = async (userId) => {
    try {
      await axios.post(`/api/admin/mentor/approve/${userId}`);
      await fetchUsers();
      await fetchMentorRequests();
    } catch (err) {
      console.error("멘토 승인 실패", err);
    }
  };

  const handleRevokeMentor = async (userId) => {
    if (!userId) {
      console.error("⚠️ userId가 유효하지 않음:", userId);
      return;
    }
    try {
      await axios.post(`/api/admin/mentor/revoke/${userId}`);
      await fetchUsers();
      await fetchMentorRequests();
    } catch (err) {
      console.error("멘토 철회 실패", err);
    }
  };

  const handleApproveCertification = async (userId) => {
    await handleGrantMentor(userId);
  };

  const handleDenyCertification = async (userId) => {
    try {
      await axios.post(`/api/admin/mentor/deny/${userId}`);
      await fetchMentorRequests();
    } catch (err) {
      console.error("멘토 거절 실패", err);
    }
  };

  const openBanModal = (user) => {
    setSelectedUser(user);
    setBanModalOpen(true);
  };

  const closeBanModal = () => {
    setSelectedUser(null);
    setBanModalOpen(false);
  };

  // ✅ 블랙리스트 해제 로직
  const handleUnbanUser = async (userId) => {
    try {
      await axios.post(`/api/admin/unban-user/${userId}`);
      await fetchUsers(); // 목록 갱신
      alert("✅ 블랙리스트 해제 완료");
    } catch (err) {
      console.error("블랙리스트 해제 실패", err);
      alert("❌ 해제 실패");
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name.includes(searchTerm) || user.email.includes(searchTerm)
  );

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
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="사용자 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.userId} className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/30">
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
                      <Badge variant={
                        user.roles === "ROLE_MENTOR" ? "default" :
                        user.roles === "ROLE_ADMIN" ? "destructive" : "secondary"
                      }>
                        {user.roles.replace("ROLE_", "")}
                      </Badge>
                      <Badge variant={user.isBanned ? "secondary" : "default"}>
                        {user.isBanned ? "비활성" : "활성"}
                      </Badge>
                      <div className="flex gap-2">
                        {user.roles === "ROLE_MENTOR" && (
                          <Button size="sm" variant="warning" onClick={() => handleRevokeMentor(user.userId)}>
                            멘토 권한 철회
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            user.isBanned
                              ? handleUnbanUser(user.userId)
                              : openBanModal(user)
                          }
                        >
                          {user.isBanned ? "블랙리스트 해제" : "블랙리스트 지정"}
                        </Button>
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
                {certificationRequests.map((req) => (
                  <div key={req.userId} className="p-4 bg-background/50 rounded-lg border border-border/30">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-foreground">{req.name}</h3>
                        <p className="text-sm text-muted-foreground">최종학력</p>
                        <p className="font-medium">{req.studentCourse}</p>
                      </div>
                      <Badge variant="secondary">대기중</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">전공</p>
                        <p className="font-medium">{req.specialite}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">경력</p>
                        <p className="font-medium">{req.experienceYear}년</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">소개</p>
                        <p className="font-medium">{req.introduction}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4 mr-1" />
                        서류 보기
                      </Button>
                      <Button size="sm" variant="success" onClick={() => handleApproveCertification(req.userId)}>
                        승인
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDenyCertification(req.userId)}>
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

      <BanModal open={banModalOpen} onClose={closeBanModal} user={selectedUser} onSuccess={fetchUsers} />
    </div>
  );
};

export default UserManagement;
