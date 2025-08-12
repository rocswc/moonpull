import Navigation from "@/components/Navigation";
import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {Mail, User, Phone, Tag, Calendar, GraduationCap, BookOpen, IdCard, ArrowLeft} from "lucide-react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

const SocialJoinPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const { login } = useAuth(); // ✅ AuthContext 로그인 함수

  const [submitting, setSubmitting] = useState(false);
  const [phoneRaw, setPhoneRaw] = useState("");                 // ✅ 추가: 숫자만 보관하는 전화번호 상태

  const [formData, setFormData] = useState({
    social_type: "",
    social_id: "",
    login_id: "",
    is_social: true,
    email: "",
    name: "",
    nickname: "",
    phone_number: "", // ← 이 값에는 항상 숫자만 넣을 겁니다.
    birthday: "",
    gender: "",
    roles: "",
    university: "",
    major: "",
    graduation_file: null as File | null,
  });

  // provider 라벨 매핑
  const providerParam = (params.get("provider") || "").toUpperCase();
  const providerLabelMap: Record<string, string> = {
    KAKAO: "카카오",
    GOOGLE: "구글",
    NAVER: "네이버",
  };
  const providerLabel = providerLabelMap[providerParam] || "소셜";

  // 쿼리스트링 → 초기값 세팅
  useEffect(() => {
    const provider = params.get("provider")?.toUpperCase() || "";
    const socialId = params.get("socialId") || "";
    const email = params.get("email") || "";
    const nameFromQS = params.get("name") || "";

    if (!provider || !socialId) {
      alert("잘못된 접근입니다.");
      navigate("/auth/login", { replace: true });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      social_type: provider,
      social_id: socialId,
      login_id: `${provider}_${socialId}`,
      email,
      name: nameFromQS,
    }));
  }, [location.search, navigate]);

  // ✅ 추가: 화면 표시용 포맷터 (하이픈 포함 표시)
  const formatPhone = (d: string) => {
    const s = d.slice(0, 11);
    if (s.length <= 3) return s;
    if (s.length <= 7) return `${s.slice(0, 3)}-${s.slice(3)}`;
    return `${s.slice(0, 3)}-${s.slice(3, 7)}-${s.slice(7)}`;
  };

  // ✅ 추가: 전화번호 전용 onChange — 숫자만 상태에 저장
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
    setPhoneRaw(digits); // 화면 포맷용
    setFormData((p) => ({ ...p, phone_number: digits })); // formData에는 숫자만
  };

  // 입력 핸들러 (전화번호 제외 모두 처리)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, files } = e.target as HTMLInputElement;
    if (type === "file") {
      setFormData((p) => ({ ...p, [name]: files && files.length > 0 ? files[0] : null }));
      return;
    }
    // ❌ 삭제했던 부분: (name === "phone_number") 분기 전체 삭제
    // ✅ 수정: 전화번호가 아닌 나머지만 공통 처리
    setFormData((p) => ({ ...p, [name]: value }));
  };

  // 닉네임 중복 확인
  const checkDuplicateNickname = async () => {
    const value = formData.nickname.trim();
    if (!value) return alert("닉네임을 먼저 입력하세요.");
    try {
      const res = await axios.get("/api/check-duplicate", {
        params: { type: "nickname", value },
        withCredentials: true,
      });
      alert(res.data?.exists ? "이미 사용 중인 닉네임입니다." : "사용 가능한 닉네임입니다.");
    } catch (e) {
      console.error(e);
      alert("중복 확인 중 오류가 발생했습니다.");
    }
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    // 필수값 검증
    if (!formData.name.trim()) return alert("이름을 입력하세요.");
    if (!formData.nickname.trim()) return alert("닉네임을 입력하세요.");
    if (!formData.phone_number.trim()) return alert("전화번호를 입력하세요.");
    if (!formData.birthday.trim()) return alert("생년월일을 입력하세요.");
    if (!formData.gender) return alert("성별을 선택하세요.");
    if (!formData.roles) return alert("역할을 선택하세요.");
    if (!formData.email.trim()) return alert("이메일을 입력하세요.");
    if (
      formData.roles === "MENTOR" &&
      (!formData.university.trim() || !formData.major.trim() || !formData.graduation_file)
    ) {
      return alert("멘토는 대학교/전공/졸업증명서가 필요합니다.");
    }

    try {
      setSubmitting(true);

      // ✅ 서버 컨트롤러가 @RequestPart("joinDTO")로 받으므로 Blob(JSON)로 담아 전송
      const joinDTO = {
        login_id: formData.login_id,
        is_social: formData.is_social,
        social_type: formData.social_type,
        social_id: formData.social_id,
        email: formData.email,
        name: formData.name,
        nickname: formData.nickname.trim(),
        phone_number: formData.phone_number, // ✅ 수정: 이미 숫자만이므로 replace 불필요
        birthday: formData.birthday,
        gender: formData.gender,
        roles: formData.roles,
        university: formData.university,
        major: formData.major,
      };

      const form = new FormData();
      form.append("joinDTO", new Blob([JSON.stringify(joinDTO)], { type: "application/json" }));
      if (formData.roles === "MENTOR" && formData.graduation_file) {
        form.append("graduation_file", formData.graduation_file);
      }
	  

	  // 1) 회원가입
	  await axios.post("/api/join", form, { withCredentials: true });

	  // 2) 서버가 쿠키를 세팅했다면, 내 정보 가져와서 컨텍스트 갱신
	  try {
	    const me = await axios.get("/api/user", { withCredentials: true }).then(r => r.data);
	    login?.(me);                  // useAuth()에서 가져온 로그인 set 함수
	    navigate("/", { replace: true });
	  } catch {
	    // 쿠키가 없다면(백엔드가 아직 쿠키 안 심는다면) 로그인 페이지로 보냄
	    navigate("/auth/login", { replace: true });
	  }
	  return; // 아래 코드 실행 금지

      
    } catch (error) {
      console.error(error);
      const data =
        (axios.isAxiosError(error) && error.response?.data) as { message?: string; error?: string } | undefined;
      alert(data?.message || data?.error || "회원가입 중 오류 발생");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="mx-auto w-full max-w-md space-y-8">
            {/* 헤더 */}
            <div className="text-center space-y-4">
              <Link to="/" className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4" />
                <span>홈으로 돌아가기</span>
              </Link>
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xl">V</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold">{providerLabel} 회원가입</h1>
              <p className="text-muted-foreground">소셜 로그인 후 추가 정보를 입력해주세요.</p>
            </div>

            {/* 카드 */}
            <Card className="shadow-elegant border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader />
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                  {formData.email ? (
                    <Input name="email" value={formData.email} readOnly />
                  ) : (
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  )}

				  <div className="relative">
				    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
				    <Input
				      name="name"
				      placeholder="이름"
				      value={formData.name}
				      onChange={handleChange}
				      className="pl-10"
				      required
				    />
				  </div>

				  <div className="flex gap-2">
				    <div className="relative w-full">
				      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
				      <Input
				        name="nickname"
				        placeholder="닉네임"
				        value={formData.nickname}
				        onChange={handleChange}
				        className="pl-10"
				        required
				      />
				    </div>
				    <Button type="button" onClick={checkDuplicateNickname}>
				      중복확인
				    </Button>
				  </div>

                  {/* ✅ 수정: 전화번호 인풋 교체 */}
				  <div className="relative">
				    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
				    <Input
				      name="phone_number"
				      placeholder="전화번호"
				      inputMode="numeric"
				      value={formatPhone(phoneRaw)}   // 화면에는 하이픈
				      onChange={handlePhoneChange}    // 상태에는 숫자만
				      className="pl-10"
				      required
				    />
				  </div>

                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      name="birthday"
                      placeholder="생년월일 (예: 19990101)"
                      value={formData.birthday}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          birthday: e.target.value.replace(/\D/g, "").slice(0, 8),
                        }))
                      }
                      className="pl-10"
                      required
                    />
                  </div>

                  {/* 성별 선택 */}
                  <div>
                    <Label className="mb-1 block">성별 선택</Label>
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
                    <Label className="mb-1 block">역할 선택</Label>
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

                  {/* 멘토 전용 */}
                  {formData.roles === "MENTOR" && (
                    <>
					<div className="relative">
					  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
					  <Input
					    name="university"
					    placeholder="대학교"
					    value={formData.university}
					    onChange={handleChange}
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
					    onChange={handleChange}
					    className="pl-10"
					    required
					  />
					</div>
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
					    onChange={handleChange}
					    className="hidden"
					    required
					  />
                    </>
                  )}

                  <Button type="submit" variant="hero" size="lg" className="w-full" disabled={submitting}>
                    {submitting ? "처리 중..." : "회원가입"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default SocialJoinPage;
