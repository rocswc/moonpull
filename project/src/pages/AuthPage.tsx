import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {Eye, EyeOff, Mail, Lock, User, ArrowLeft, IdCard, Phone, Tag, Calendar, GraduationCap, BookOpen
} from "lucide-react";
import axios, { AxiosError } from "axios";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import KakaoLoginButton from "@/components/socialLogin/KakaoLoginButton";
import GoogleLoginButton from "@/components/socialLogin/GoogleLoginButton";

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, login } = useAuth();

  const [isLogin, setIsLogin] = useState(location.pathname.includes("/login"));
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    login_id: "",
    is_social: false,
    social_type: "",
    social_id: "",
    nickname: "",
    name: "",
    birthday: "",
    gender: "",
    phone_number: "",
    email: "",
    password: "",
    confirmPassword: "",
    roles: "",
    university: "",
    major: "",
    graduation_file: null as File | null,
  });

  // 1) 쿼리 파라미터 읽어서 로그인 필요 시 토스트 띄우기
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("reason") === "unauthorized") {
      toast.warning("로그인이 필요합니다.");
    }
  }, [location]);

  // 2) 로그인 상태면 홈으로 이동
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  // 3) 경로 변화 감지해서 로그인/회원가입 모드 관리
  useEffect(() => {
    setIsLogin(location.pathname.includes("/login"));
  }, [location.pathname]);

  const resetToLogin = () => {
    setFormData({
      login_id: "",
      is_social: false,
      social_type: "",
      social_id: "",
      nickname: "",
      name: "",
      birthday: "",
      gender: "",
      phone_number: "",
      email: "",
      password: "",
      confirmPassword: "",
      roles: "",
      university: "",
      major: "",
      graduation_file: null,
    });
    navigate("/auth/login");
  };

  const validatePassword = (password: string) =>
    /^(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/.test(password);

  const validateEmail = (email: string) => /^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(email);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, files } = e.target as HTMLInputElement;
    if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        [name]: files && files.length > 0 ? files[0] : null,
      }));
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
      setFormData((prev) => ({ ...prev, [name]: newValue }));
    }
  };

  const checkDuplicate = async (type: "login_id" | "email" | "nickname") => {
    const value = formData[type];
    const labels = {
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
      alert(res.data.exists ? `이미 사용 중인 ${labels[type]}입니다.` : `사용 가능한 ${labels[type]}입니다.`);
    } catch {
      alert("중복 확인 중 오류가 발생했습니다.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin) {
      if (!validatePassword(formData.password)) {
        alert("비밀번호는 8자 이상이며 특수문자를 하나 이상 포함해야 합니다.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
        return;
      }
      if (!validateEmail(formData.email)) {
        alert("올바른 이메일 형식을 입력하세요.");
        return;
      }
	  if (!/^\d{11}$/.test(formData.phone_number.replace(/-/g, ""))) {
	      alert("전화번호는 숫자 11자리여야 합니다.");
	      return;
	    }
    }
    try {
      if (!isLogin) {
        const joinPayload = {
          login_id: formData.login_id,
          password: formData.password,
          is_social: formData.is_social,
          social_type: formData.social_type || null,
          social_id: formData.social_id || null,
          name: formData.name,
          nickname: formData.nickname,
          birthday: formData.birthday,
          gender: formData.gender,
          roles: formData.roles,
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
          withCredentials: true,
        });

        alert("회원가입이 완료되었습니다.");
        resetToLogin();
      } else {
        const res = await axios.post("/api/login", {
          loginId: formData.login_id,
          password: formData.password,
        }, { withCredentials: true });
		if (res.data.token) {
		   localStorage.setItem("token", res.data.token);
		   login(res.data); // AuthContext의 로그인 처리 함수
		   navigate("/");
		 } else {
		   alert("토큰이 응답에 포함되지 않았습니다.");
		 }
       
      }
	  } 	  catch (error) {
	         let msg = "알 수 없는 오류가 발생했습니다.";

	          if (axios.isAxiosError(error)) {
	            const err = error as AxiosError<{ message?: string; error?: string }>;
	            const status = err.response?.status;

	            if (status === 403 && err.response?.data?.message) {
	              alert(err.response.data.message); // 정지 사유 등 알림
	              return;
	            }

	            msg = err.response?.data?.message || err.response?.data?.error || msg;
	          }

	          alert(msg);
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
				    <div className="relative w-full">
				      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
				      <Input name="login_id" placeholder="아이디" value={formData.login_id}
				             onChange={handleInputChange} required className="pl-10" />
				    </div>
				    <Button type="button" onClick={() => checkDuplicate("login_id")}>중복확인</Button>
				  </div>

				  <div className="flex gap-2">
				    <div className="relative w-full">
				      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
				      <Input
				        name="nickname"
				        placeholder="닉네임"
				        value={formData.nickname}
				        onChange={handleInputChange}
				        required
				        className="pl-10"
				      />
				    </div>
				    <Button type="button" onClick={() => checkDuplicate("nickname")}>중복확인</Button>
				  </div>

					{/* 이메일 입력 */}
					<div className="flex gap-2">
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

					<div className="relative">
					  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
					  <Input
					    name="name"
					    placeholder="이름"
					    value={formData.name}
					    onChange={handleInputChange}
					    required
					    className="pl-10"
					  />
					</div>

					<div className="relative">
					  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
					  <Input
					    name="birthday"
					    placeholder="생년월일 (예: 19990101)"
					    value={formData.birthday}
					    onChange={(e) => {
					      const onlyNums = e.target.value.replace(/\D/g, "").slice(0, 8); // 숫자만, 8자리 제한
					      setFormData((prev) => ({ ...prev, birthday: onlyNums }));
					    }}
					    className="pl-10"
					    required
					  />
					</div>

					
					<div className="relative">
					  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
					  <Input
					    name="phone_number"
					    placeholder="전화번호"
					    value={formData.phone_number}
					    onChange={handleInputChange}
					    className="pl-10"
					    required
					  />
					</div>
					  {/* 성별 선택 */}
					  <div>
					    <span className="block mb-1 text-sm font-medium">성별 선택</span>
					    <div className="flex gap-2">
					      <Button
					        type="button"
					        variant={formData.gender === "M" ? "default" : "outline"}
					        onClick={() => setFormData((p) => ({ ...p, gender: "M" }))}
					      >
					        남성
					      </Button>
					      <Button
					        type="button"
					        variant={formData.gender === "F" ? "default" : "outline"}
					        onClick={() => setFormData((p) => ({ ...p, gender: "F" }))}
					      >
					        여성
					      </Button>
					    </div>
					  </div>

					  {/* 역할 선택 */}
					  <div>
					    <Label htmlFor="roles" className="text-foreground mb-1 block">
					      역할 선택
					    </Label>
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
					  </div>
					

                    {formData.roles === "MENTOR" && (
                      <>
					  <div className="relative">
					    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
					    <Input
					      name="university"
					      placeholder="대학교"
					      value={formData.university}
					      onChange={handleInputChange}
					      className="pl-10"
					      required
					    />
					  </div>
					  <div className="relative">
					    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
					    <Input
					      name="major"
					      placeholder="전공"
					      value={formData.major}
					      onChange={handleInputChange}
					      className="pl-10"
					      required
					    />
					  </div>
						{formData.roles === "MENTOR" && (
						  <div className="space-y-2">
						    <div
						      role="button"
						      tabIndex={0}
						      aria-label="졸업증명서 업로드"
						      onClick={() => document.getElementById("graduation_file")?.click()}
						      onKeyDown={(e) => {
						        if (e.key === "Enter" || e.key === " ") {
						          e.preventDefault();
						          document.getElementById("graduation_file")?.click();
						        }
						      }}
						      className="
						        w-full border border-input rounded-md px-3 py-2 text-sm
						        text-muted-foreground bg-background
						        hover:border-primary cursor-pointer
						      "
						    >
						      {formData.graduation_file
						        ? (formData.graduation_file as File).name
						        : "졸업증명서 업로드 해주세요"}
						    </div>

						    <input
						      id="graduation_file"
						      type="file"
						      name="graduation_file"
						      accept=".pdf,image/*"
						      onChange={handleInputChange}
						      className="hidden"
						      required
						    />
						  </div>
						)}
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
				    <button
				      type="button"
				      className="text-sm text-primary hover:underline"
				      onClick={() => navigate("/auth/reset-password")}
				    >
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
			    <GoogleLoginButton />
			    <KakaoLoginButton />
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
