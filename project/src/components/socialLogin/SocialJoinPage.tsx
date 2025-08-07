import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "react-toastify";
import axios from "axios";
import { Mail, IdCard } from "lucide-react";

interface SocialJoinFormData {
  social_type: string;
  social_id: string;
  login_id: string;
  password: string;
  is_social: boolean;
  email: string;
  name: string;
  nickname: string;
  phone_number: string;
  birthday: string;
  gender: string;
  roles: string;
  university: string;
  major: string;
  graduation_file: File | null;
}

const SocialJoinPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);

  const [formData, setFormData] = useState<SocialJoinFormData>({
    social_type: "",
    social_id: "",
    login_id: "",
    password: "SOCIAL_USER",
    is_social: true,
    email: "",
    name: "",
    nickname: "",
    phone_number: "",
    birthday: "",
    gender: "",
    roles: "",
    university: "",
    major: "",
    graduation_file: null,
  });

  useEffect(() => {
    const provider = params.get("provider")?.toUpperCase() || "";
    const socialId = params.get("socialId") || "";
    const email = params.get("email") || "";
    const name = params.get("name") || "";

    if (!provider || !socialId || !email) {
      toast.error("잘못된 접근입니다.");
      navigate("/auth/login");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      social_type: provider,
      social_id: socialId,
      login_id: `${provider.toLowerCase()}_${socialId}`,
      email,
      name,
    }));
  }, [location.search, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, files } = e.target as HTMLInputElement;
    if (type === "file") {
      setFormData((p) => ({ ...p, [name]: files && files.length > 0 ? files[0] : null }));
    } else {
      let newValue = value;
      if (name === "phone_number") {
        const onlyNums = value.replace(/\D/g, "").slice(0, 11);
        if (onlyNums.length >= 11) {
          newValue = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3, 7)}-${onlyNums.slice(7)}`;
        } else if (onlyNums.length >= 7) {
          newValue = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3, 7)}-${onlyNums.slice(7)}`;
        } else if (onlyNums.length >= 4) {
          newValue = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3)}`;
        } else {
          newValue = onlyNums;
        }
      }
      setFormData((p) => ({ ...p, [name]: newValue }));
    }
  };

  const checkDuplicate = async () => {
    const value = formData.nickname;
    if (!value) return alert("닉네임을 입력하세요.");
    try {
      const res = await axios.get("/api/check-duplicate", {
        params: { type: "nickname", value },
        withCredentials: true,
      });
      alert(res.data.exists ? "이미 사용 중입니다." : "사용 가능한 닉네임입니다.");
    } catch {
      alert("중복 확인 중 오류 발생");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const joinDTO = {
        login_id: formData.login_id,
        password: formData.password,
        is_social: formData.is_social,
        social_type: formData.social_type,
        social_id: formData.social_id,
        email: formData.email,
        name: formData.name,
        nickname: formData.nickname,
        phone_number: formData.phone_number.replace(/-/g, ""),
        birthday: formData.birthday,
        gender: formData.gender,
        roles: formData.roles,
        university: formData.university,
        major: formData.major,
      };

      const form = new FormData();
      form.append("joinDTO", new Blob([JSON.stringify(joinDTO)], { type: "application/json" }));
      if (formData.graduation_file) {
        form.append("graduation_file", formData.graduation_file);
      }

      await axios.post("/api/social-join", form, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      toast.success("소셜 회원가입 완료!");
      navigate("/");
    } catch (err) {
      toast.error("회원가입 중 오류 발생");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex justify-center items-center px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <h2 className="text-2xl font-bold text-center">소셜 회원가입</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="email" value={formData.email} readOnly />
            <Input name="name" value={formData.name} readOnly />
            <div className="flex gap-2">
              <Input
                name="nickname"
                placeholder="닉네임"
                value={formData.nickname}
                onChange={handleChange}
                required
              />
              <Button type="button" onClick={checkDuplicate}>중복확인</Button>
            </div>
            <Input
              name="phone_number"
              placeholder="전화번호"
              value={formData.phone_number}
              onChange={handleChange}
              required
            />
            <div className="relative">
              <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                name="birthday"
                placeholder="생년월일 (예: 19990101)"
                value={formData.birthday}
                onChange={(e) => {
                  const onlyNums = e.target.value.replace(/\D/g, "").slice(0, 8);
                  setFormData((p) => ({ ...p, birthday: onlyNums }));
                }}
                className="pl-10"
                required
              />
            </div>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded-md"
            >
              <option value="">성별 선택</option>
              <option value="M">남성</option>
              <option value="F">여성</option>
            </select>
            <Label>역할 선택</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formData.roles === "MENTEE" ? "default" : "outline"}
                onClick={() => setFormData((p) => ({ ...p, roles: "MENTEE" }))}
              >
                멘티
              </Button>
              <Button
                type="button"
                variant={formData.roles === "MENTOR" ? "default" : "outline"}
                onClick={() => setFormData((p) => ({ ...p, roles: "MENTOR" }))}
              >
                멘토
              </Button>
            </div>
            {formData.roles === "MENTOR" && (
              <>
                <Input
                  name="university"
                  placeholder="대학교"
                  value={formData.university}
                  onChange={handleChange}
                  required
                />
                <Input
                  name="major"
                  placeholder="전공"
                  value={formData.major}
                  onChange={handleChange}
                  required
                />
                <Label htmlFor="graduation_file">졸업증명서</Label>
                <Input
                  type="file"
                  name="graduation_file"
                  accept=".pdf,image/*"
                  onChange={handleChange}
                  required
                />
              </>
            )}
            <Button type="submit" className="w-full mt-4">회원가입</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialJoinPage;
