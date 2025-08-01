import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // ✅ useLocation 추가
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, IdCard } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

// ✅ 컴포넌트 props 제거 (더 이상 필요 없음)
const AuthPage = () => {
  const location = useLocation(); // ✅ 현재 경로 확인
  const isLogin = location.pathname.includes("/login"); // ✅ 경로가 /auth/login인지 여부로 로그인/회원가입 분기

  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth(); // ✅ 전역 로그인 상태 설정 함수
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    login_id: "",
    is_social: false,
    social_type: "",
    social_id: "",
    nickname: "",
    name: "",
    national_id: "",
    phone_number: "",
    email: "",
    password: "",
    confirmPassword: "",
    roles: "",
    university: "",
    major: "",
    graduation_file: null as File | null,
  });

  // ✅ 로그인 상태로 이동 + 폼 초기화만 수행
  const resetToLogin = () => {
    setFormData({
      login_id: "",
      is_social: false,
      social_type: "",
      social_id: "",
      nickname: "",
      name: "",
      national_id: "",
      phone_number: "",
      email: "",
      password: "",
      confirmPassword: "",
      roles: "",
      university: "",
      major: "",
      graduation_file: null,
    });
    navigate("/auth/login"); // ✅ 경로 전환만 수행
  };

  const validatePassword = (password: string) =>
    /^(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{10,}$/.test(password);

  const validateNationalId = (id: string) => /^\d{6}-\d{7}$/.test(id);

  const validateEmail = (email: string) => /^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(email);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.target instanceof HTMLInputElement) {
      const { name, value, type, files } = e.target;

      if (type === "file") {
        setFormData((prev) => ({
          ...prev,
          [name]: files && files.length > 0 ? (files[0] as File) : null,
        }));
        return;
      }

      let newValue = value;

      // 주민번호/전화번호 형식 자동 변환
      if (name === "national_id") {
        const onlyNums = value.replace(/\D/g, "").slice(0, 13);
        newValue =
          onlyNums.length > 6 ? onlyNums.slice(0, 6) + "-" + onlyNums.slice(6) : onlyNums;
      } else if (name === "phone_number") {
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

      setFormData((prev) => ({
        ...prev,
        [name]: newValue,
      }));
    }
  };

  const checkDuplicate = async (type: "login_id" | "email" | "nickname" ) => {
    const value = formData[type];

    // 사용자 친화적인 한국어 라벨
    const labels: Record<typeof type, string> = {
      login_id: "아이디",
      email: "이메일",
      nickname: "닉네임",
    };

    if (!value) {
      alert(`${labels[type]}를 먼저 입력하세요.`);
      return;
    }

    try {
      const res = await axios.get("/api/check-duplicate", {
        params: { type, value },
        withCredentials: true,
      });

      if (res.data.exists) {
        alert(`이미 사용 중인 ${labels[type]}입니다.`);
      } else {
        alert(`사용 가능한 ${labels[type]}입니다.`);
      }
    } catch (err) {
      alert("중복 확인 중 오류가 발생했습니다.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin) {
      // 회원가입 유효성 체크
      if (!validatePassword(formData.password)) {
        alert("비밀번호는 10자 이상이며 특수문자를 하나 이상 포함해야 합니다.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
        return;
      }
      if (!validateNationalId(formData.national_id)) {
        alert("주민등록번호는 앞자리 6자리-뒷자리 7자리 형식으로 입력해야 합니다.");
        return;
      }
      if (!validateEmail(formData.email)) {
        alert("올바른 이메일 형식을 입력하세요.");
        return;
      }
    }

    try {
      if (!isLogin) {
        //  회원가입 요청
        const joinPayload = {
          login_id: formData.login_id,
          password: formData.password,
          is_social: formData.is_social,
          social_type: formData.social_type || null,
          social_id: formData.social_id || null,
          name: formData.name,
          nickname: formData.nickname,
          roles: formData.roles,
          national_id: formData.national_id.replace("-", ""),
          phone_number: formData.phone_number.replace(/-/g, ""),
          email: formData.email,
          university: formData.university,
          major: formData.major,
        };

        const form = new FormData();
        form.append("joinDTO", new Blob([JSON.stringify(joinPayload)], { type: "application/json" }));
        if (formData.graduation_file) {
          form.append("graduation_file", formData.graduation_file);
        }

        await axios.post("/api/join", form, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });

        alert("회원가입이 완료되었습니다.");
        resetToLogin(); // ✅ 로그인 화면으로 이동
      } else {
        // ✅ 로그인 요청
        const res = await axios.post(
          "/api/login",
          {
            loginId: formData.login_id,
            password: formData.password,
          },
          { withCredentials: true }
        );

        const { nickname, roles } = res.data;
        login(nickname, roles); // ✅ 전역 상태 저장
        alert("로그인 성공!");
        navigate("/");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data as { message?: string; error?: string } | undefined;
		const msg = data?.message || data?.error || "요청 처리에 실패했습니다.";
		alert(msg);
      } else {
        alert("알 수 없는 오류가 발생했습니다.");
      }
    }
  };

  
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <Link
              to="/"
              className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>홈으로 돌아가기</span>
            </Link>
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">V</span>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {isLogin ? "로그인" : "회원가입"}
              </h1>
              <p className="text-muted-foreground mt-2">
                {isLogin ? "moonpool 계정으로 로그인하세요" : "새로운 moonpool 계정을 만드세요"}
              </p>
            </div>
          </div>

          {/* Auth Card */}
          <Card className="shadow-elegant border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader className="space-y-1">
              <div className="grid grid-cols-2 gap-2">
			  <Button
			    variant={isLogin ? "default" : "ghost"}
			    className={isLogin ? "bg-gradient-primary text-primary-foreground" : ""}
			    onClick={() => navigate("/auth/login")}
			  >
			    로그인
			  </Button>
			  <Button
			    variant={!isLogin ? "default" : "ghost"}
			    className={!isLogin ? "bg-gradient-primary text-primary-foreground" : ""}
			    onClick={() => navigate("/auth/signup")}
			  >
			    회원가입
			  </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 회원가입 필드 */}
                {!isLogin && (
                  <>
                    <div className="flex gap-2">
                      <Input
                        name="login_id"
                        placeholder="아이디"
                        value={formData.login_id}
                        onChange={handleInputChange}
                        required
                      />
                      <Button type="button" onClick={() => checkDuplicate("login_id")}>
                        중복확인
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Input
                        name="nickname"
                        placeholder="닉네임"
                        value={formData.nickname}
                        onChange={handleInputChange}
                        required
                        className="w-full"
                      />
                      <Button
                        type="button"
                        onClick={() => checkDuplicate("nickname")}
                        className="whitespace-nowrap"
                      >
                        중복확인
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground">
                        이메일
                      </Label>
                      <div className="relative flex gap-2">
                        <div className="relative w-full">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="이메일을 입력하세요"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="pl-10"
                            required
                          />
                        </div>
                        <Button type="button" onClick={() => checkDuplicate("email")}>
                          중복확인
                        </Button>
                      </div>
                    </div>

                    <Input
                      name="name"
                      placeholder="이름을 입력하세요"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />

                    <div className="relative">
                      <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        name="national_id"
                        placeholder="주민등록번호 (000000-0000000)"
                        value={formData.national_id}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>

                    <Input
                      name="phone_number"
                      placeholder="전화번호"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      required
                    />

                    <Label htmlFor="roles">역할 선택</Label>
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
                          onChange={handleInputChange}
                          required
                        />
                        <Input
                          name="major"
                          placeholder="전공"
                          value={formData.major}
                          onChange={handleInputChange}
                          required
                        />
                        <Label htmlFor="graduation_file">졸업증명서</Label>
                        <Input
                          type="file"
                          name="graduation_file"
                          accept=".pdf,image/*"
                          onChange={handleInputChange}
                          required
                        />
                      </>
                    )}
                  </>
                )}

                {/* 로그인 필드 */}
                {isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="login_id" className="text-foreground">
                      아이디
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login_id"
                        name="login_id"
                        type="text"
                        placeholder="아이디를 입력하세요"
                        value={formData.login_id}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">
                    비밀번호
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="비밀번호를 입력하세요"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-foreground">
                      비밀번호 확인
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="비밀번호를 다시 입력하세요"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                )}

                {isLogin && (
                  <div className="text-right">
                    <button type="button" className="text-sm text-primary hover:underline">
                      비밀번호를 잊으셨나요?
                    </button>
                  </div>
                )}

                <Button type="submit" variant="hero" size="lg" className="w-full">
                  {isLogin ? "로그인" : "회원가입"}
                </Button>
              </form>

              <div className="relative">
                <Separator className="my-4" />
                <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                  또는
                </span>
              </div>

              <div className="space-y-3">
                <Button type="button" variant="outline" size="lg" className="w-full">
                  구글로 {isLogin ? "로그인" : "회원가입"}
                </Button>
                <Button type="button" variant="outline" size="lg" className="w-full">
                  카카오로 {isLogin ? "로그인" : "회원가입"}
                </Button>
                <Button type="button" variant="outline" size="lg" className="w-full">
                  네이버로 {isLogin ? "로그인" : "회원가입"}
                </Button>
              </div>

              {!isLogin && (
                <p className="text-xs text-muted-foreground text-center">
                  회원가입시{" "}
                  <button className="text-primary hover:underline">이용약관</button> 및{" "}
                  <button className="text-primary hover:underline">개인정보처리방침</button>
                  에 동의하게 됩니다.
                </p>
              )}
           

            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AuthPage;
