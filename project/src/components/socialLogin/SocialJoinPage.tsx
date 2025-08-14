import Navigation from "@/components/Navigation";
import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, User, Phone, Tag, Calendar, GraduationCap, BookOpen, IdCard, ArrowLeft } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const SocialJoinPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const { login } = useAuth(); // ✅ AuthContext 로그인 함수

  const [submitting, setSubmitting] = useState(false);
  const [phoneRaw, setPhoneRaw] = useState("");                 // 숫자만 보관하는 전화번호 상태

  // ✨ 연동 모달 상태 + 입력값
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkLoginId, setLinkLoginId] = useState("");
  const [linkPassword, setLinkPassword] = useState("");
  const [linkSubmitting, setLinkSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    social_type: "",
    social_id: "",
    login_id: "",
    is_social: true,
    email: "",
    name: "",
    nickname: "",
    phone_number: "", // ← 항상 숫자만
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

  // 화면 표시용 포맷터 (하이픈)
  const formatPhone = (d: string) => {
    const s = d.slice(0, 11);
    if (s.length <= 3) return s;
    if (s.length <= 7) return `${s.slice(0, 3)}-${s.slice(3)}`;
    return `${s.slice(0, 3)}-${s.slice(3, 7)}-${s.slice(7)}`;
  };

  // 전화번호 전용 onChange — 숫자만 상태에 저장
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
    setPhoneRaw(digits); // 화면 포맷용
    setFormData((p) => ({ ...p, phone_number: digits })); // formData에는 숫자만
  };

  // 공통 입력 핸들러 (파일/전화번호 제외)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, files } = e.target as HTMLInputElement;
    if (type === "file") {
      setFormData((p) => ({ ...p, [name]: files && files.length > 0 ? files[0] : null }));
      return;
    }
    setFormData((p) => ({ ...p, [name]: value }));
  };

  // ✨ 기존 계정과 소셜 계정 연동 API 호출 (독립 함수)
  // 기존 계정과 소셜 계정 연동 (수정본)
  const linkExistingAccount = async () => {
    if (!linkLoginId.trim() || !linkPassword.trim()) {
      alert("아이디와 비밀번호를 입력하세요.");
      return;
    }
    if (!formData.social_type || !formData.social_id) {
      alert("소셜 정보가 없습니다. 다시 시도하세요.");
      return;
    }

    setLinkSubmitting(true);
    try {
      // 1) 연동 호출 (이 API는 로그인/쿠키 발급을 하지 않음)
      await axios.post(
        "/api/auth/social-link",
        {
          loginId: linkLoginId.trim(),
          password: linkPassword,
          socialType: formData.social_type,
          socialId: formData.social_id,
        },
        { withCredentials: true }
      );

      // 2A) (선택1) 자동 로그인까지 해주고 /api/user 조회
      await axios.post(
        "/api/login",
        { loginId: linkLoginId.trim(), password: linkPassword },
        { withCredentials: true }
      );
      const me = await axios.get("/api/user", { withCredentials: true }).then(r => r.data);
      login?.(me);
      setLinkOpen(false);
      navigate("/", { replace: true });

      // ※ 자동 로그인을 원치 않으면 2B로 대체:
      // alert("계정 연동이 완료됐습니다. 로그인해 주세요.");
      // setLinkOpen(false);
      // navigate("/auth/login", { replace: true });

	  } catch (err: unknown) {
	    // axios 에러인지부터 구분
	    if (axios.isAxiosError(err)) {
	      const st = err.response?.status;
	      const isLinkCall = err.config?.url?.includes("/api/auth/social-link");

	      const msg =
	        isLinkCall && st === 403 ? "비밀번호가 올바르지 않습니다."
	        : isLinkCall && st === 409 ? "이미 다른 계정에 연동된 소셜입니다."
	        : err.response?.data?.message || "연동에 실패했습니다.";

	      alert(msg);
	    } else {
	      // 비-axios 에러 안전 처리
	      console.error(err);
	      alert("알 수 없는 오류가 발생했습니다.");
	    }
	  } finally {
	    setLinkSubmitting(false);
	  }
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
    if (!/^\d{11}$/.test(formData.phone_number)) return alert("전화번호는 숫자 11자리여야 합니다.");
    if (!formData.birthday.trim()) return alert("생년월일을 입력하세요.");
    if (!/^\d{8}$/.test(formData.birthday)) return alert("생년월일은 숫자 8자리여야 합니다. 예: 19990101");
    if (!formData.gender) return alert("성별을 선택하세요.");
    if (!formData.roles) return alert("역할을 선택하세요.");
    if (!formData.email.trim()) return alert("이메일을 입력하세요.");
    if (!/^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(formData.email)) return alert("올바른 이메일 형식을 입력하세요.");
    if (
      formData.roles === "MENTOR" &&
      (!formData.university.trim() || !formData.major.trim() || !formData.graduation_file)
    ) {
      return alert("멘토는 대학교, 전공, 졸업증명서를 모두 입력해야 합니다.");
    }

    try {
      setSubmitting(true);

      // 서버 컨트롤러가 @RequestPart("joinDTO")로 받으므로 Blob(JSON)로 담아 전송
      const joinDTO = {
        login_id: formData.login_id,
        is_social: formData.is_social,
        social_type: formData.social_type,
        social_id: formData.social_id,
        email: formData.email,
        name: formData.name,
        nickname: formData.nickname.trim(),
        phone_number: formData.phone_number,
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
        const me = await axios.get("/api/user", { withCredentials: true }).then((r) => r.data);
        login?.(me);
        navigate("/", { replace: true });
      } catch {
        navigate("/auth/login", { replace: true });
      }
      return;
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

            {/* ✨ 기존 계정 연동 섹션 */}
            <div className="rounded-2xl border p-4">
              <div className="mb-2 text-lg font-semibold">이미 계정이 있나요?</div>
              <p className="text-sm text-muted-foreground">
                기존 이메일/아이디로 가입한 계정이 있다면 비밀번호 확인 후 소셜 계정과 연동할 수 있어요.
              </p>
              <div className="mt-3">
			  <Button
			    variant="hero"   // ← 회원가입 버튼과 동일 보라색
			    onClick={() => setLinkOpen(true)}
			    disabled={!formData.social_type || !formData.social_id}
			    title={!formData.social_type || !formData.social_id ? "provider/socialId가 없습니다." : ""}  
			  >
			    기존 계정과 연동
			  </Button>
              </div>
            </div>

            {/* 카드 */}
            <Card className="shadow-elegant border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader />
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                  {formData.email ? (
                    <Input name="email" value={formData.email} readOnly />
                  ) : (
                    <Input name="email" type="email" value={formData.email} onChange={handleChange} required />
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

                  {/* 전화번호 */}
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      name="phone_number"
                      placeholder="전화번호"
                      inputMode="numeric"
                      value={formatPhone(phoneRaw)} // 화면에는 하이픈
                      onChange={handlePhoneChange} // 상태에는 숫자만
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
                        className="w-full border border-input rounded-md px-3 py-2 text-sm text-muted-foreground bg-background hover:border-primary cursor-pointer"
                      >
                        {formData.graduation_file ? (formData.graduation_file as File).name : "졸업증명서 업로드 해주세요"}
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

            {/* ✨ 연동 모달 */}
            <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>기존 계정과 연동</DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    제공자: <span className="font-medium">{formData.social_type || "-"}</span>
                  </div>
                  <Input
                    placeholder="로그인 아이디"
                    value={linkLoginId}
                    onChange={(e) => setLinkLoginId(e.target.value)}
                  />
                  <Input
                    type="password"
                    placeholder="비밀번호"
                    value={linkPassword}
                    onChange={(e) => setLinkPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && linkExistingAccount()}
                  />
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setLinkOpen(false)} disabled={linkSubmitting}>
                    취소
                  </Button>
                  <Button onClick={linkExistingAccount} disabled={linkSubmitting}>
                    {linkSubmitting ? "연동 중..." : "연동하기"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </>
  );
};

export default SocialJoinPage;
