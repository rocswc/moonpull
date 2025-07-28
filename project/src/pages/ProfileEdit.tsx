import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { Link } from "react-router-dom";

const ProfileEdit = () => {
  const { toast } = useToast();
  const [visibleField, setVisibleField] = useState<string | null>(null);

  const [profileData, setProfileData] = useState({
    email: "user@example.com",
    newPassword: "",
    confirmPassword: "",
    phone: "+82 10-1234-5678"
  });

  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 10;
    return Math.min(100, strength);
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
    if (name === "newPassword") setPasswordStrength(calculatePasswordStrength(value));
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
      toast({ title: "비밀번호 불일치", description: "새 비밀번호와 확인 비밀번호가 일치하지 않습니다.", variant: "destructive" });
      return;
    }
    toast({ title: "프로필 수정 완료", description: "프로필 변경 사항이 저장되었습니다." });
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength < 40) return "bg-destructive";
    if (strength < 70) return "bg-warning";
    return "bg-success";
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength < 40) return "약함";
    if (strength < 70) return "보통";
    return "강함";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
      <Navigation />
      <div className="flex max-w-7xl mx-auto px-6 py-10 gap-8 min-h-[900px]">
        <aside className="w-64 bg-white dark:bg-background rounded-2xl shadow p-6 space-y-4 min-h-full">
          <h2 className="text-xl font-bold mb-4">마이페이지</h2>
          <nav className="flex flex-col gap-3">
            <Link to="/profileEdit">
                         <Button variant="outline" className="justify-start w-full">정보 수정</Button>
                       </Link>
                       <Link to="/subscriptionStatus">
                         <Button variant="outline" className="justify-start w-full">구독 현황</Button>
                       </Link>
                       <Link to="/mypage">
                         <Button variant="outline" className="justify-start w-full">학습 현황</Button>
                       </Link>
                       <Link to="mentorReview">
                         <Button variant="outline" className="justify-start w-full">멘토 평가하기</Button>
                       </Link>
          </nav>
        </aside>

        <main className="flex-1 flex justify-center items-center">
          <div className="w-full max-w-2xl space-y-10 text-center bg-white dark:bg-background rounded-2xl shadow p-10">
            <h1 className="text-3xl font-bold text-foreground">프로필 수정</h1>
            <p className="text-muted-foreground">정보를 수정하려면 아래에서 항목을 선택하세요.</p>

            <form onSubmit={handleProfileSave} className="space-y-6">
              <div className="space-y-2">
                <Button type="button" onClick={() => setVisibleField(visibleField === "email" ? null : "email")}>이메일 수정</Button>
                {visibleField === "email" && (
                  <div className="space-y-2">
                    <Label htmlFor="email">이메일</Label>
                    <div className="flex flex-col items-center space-y-2">
                      <Input id="email" name="email" type="email" value={profileData.email} onChange={handleProfileChange} />
                      <Button type="button">중복 확인</Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Button type="button" onClick={() => setVisibleField(visibleField === "phone" ? null : "phone")}>전화번호 수정</Button>
                {visibleField === "phone" && (
                  <div className="space-y-2">
                    <Label htmlFor="phone">전화번호</Label>
                    <div className="flex flex-col items-center space-y-2">
                      <Input id="phone" name="phone" type="tel" value={profileData.phone} onChange={handleProfileChange} />
                      <Button type="button">중복 확인</Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Button type="button" onClick={() => setVisibleField(visibleField === "password" ? null : "password")}>비밀번호 변경</Button>
                {visibleField === "password" && (
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">새 비밀번호</Label>
                    <Input id="newPassword" name="newPassword" type="password" value={profileData.newPassword} onChange={handleProfileChange} />
                    {profileData.newPassword && (
                      <div className="space-y-1">
                        <div className="text-sm">강도: {getPasswordStrengthText(passwordStrength)}</div>
                        <Progress value={passwordStrength} className={`h-2 ${getPasswordStrengthColor(passwordStrength)}`} />
                      </div>
                    )}
                    <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                    <Input id="confirmPassword" name="confirmPassword" type="password" value={profileData.confirmPassword} onChange={handleProfileChange} />
                  </div>
                )}
              </div>

              <div>
                <Button type="submit">저장</Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfileEdit;
