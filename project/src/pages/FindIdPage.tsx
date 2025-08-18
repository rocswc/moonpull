import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Mail, ArrowLeft, User, Phone } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

type Mode = "email" | "phone";

const FindIdPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("email");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneRaw, setPhoneRaw] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [maskedId, setMaskedId] = useState<string | null>(null);

  const isEmail = (v: string) => /^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(v);
  const formatPhone = (v: string) => {
    const n = v.replace(/\D/g, "").slice(0, 11);
    if (n.length >= 11) return `${n.slice(0,3)}-${n.slice(3,7)}-${n.slice(7)}`;
    if (n.length >= 7)  return `${n.slice(0,3)}-${n.slice(3,7)}-${n.slice(7)}`;
    if (n.length >= 4)  return `${n.slice(0,3)}-${n.slice(3)}`;
    return n;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("이름을 입력하세요.");
      return;
    }
    if (mode === "email") {
      if (!isEmail(email)) {
        toast.error("올바른 이메일 형식을 입력하세요.");
        return;
      }
    } else {
      const digits = phoneRaw.replace(/\D/g, "");
      if (!/^\d{10,11}$/.test(digits)) {
        toast.error("휴대폰 번호를 정확히 입력하세요.");
        return;
      }
    }

    setSubmitting(true);
    setMaskedId(null);
    try {
      const payload =
        mode === "email"
          ? { name: name.trim(), email: email.trim() }
          : { name: name.trim(), phone: phoneRaw.replace(/\D/g, "") };

      // 서버는 존재 유무와 관계없이 200 + 동일 메시지 권장
      const res = await axios.post("/api/account/find-id", payload, {
        withCredentials: true,
      });

      // 서버가 선택적으로 마스킹된 아이디를 내려줄 수 있음
      // e.g., { maskedLoginId: "ab***cd" }
      const m = (res?.data?.maskedLoginId as string) || null;
      setMaskedId(m);

      if (m) {
        toast.success("계정 정보를 확인했습니다.");
      } else {
        toast.success(
          mode === "email"
            ? "등록된 이메일로 아이디 안내를 보냈습니다."
            : "등록된 휴대폰 문자로 아이디 안내를 보냈습니다."
        );
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "요청 처리 중 오류가 발생했습니다.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
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
              <h1 className="text-3xl font-bold text-foreground">아이디 찾기</h1>
              <p className="text-muted-foreground mt-2">
                이름 + 이메일 또는 휴대폰 번호로 아이디를 확인하세요.
              </p>
            </div>
          </div>

          {/* Card */}
          <Card className="shadow-elegant border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader />

            <CardContent className="space-y-6">
              {/* 탭 */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={mode === "email" ? "default" : "outline"}
                  className={mode === "email" ? "bg-gradient-primary text-primary-foreground" : ""}
                  onClick={() => setMode("email")}
                >
                  이메일로 찾기
                </Button>
                <Button
                  type="button"
                  variant={mode === "phone" ? "default" : "outline"}
                  className={mode === "phone" ? "bg-gradient-primary text-primary-foreground" : ""}
                  onClick={() => setMode("phone")}
                >
                  휴대폰으로 찾기
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 이름 */}
                <div className="space-y-2">
                  <Label htmlFor="name">이름</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="이름"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* 이메일 or 휴대폰 */}
                {mode === "email" ? (
                  <div className="space-y-2">
                    <Label htmlFor="email">이메일</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="이메일"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="phone">휴대폰 번호</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        name="phone"
                        type="text"
                        placeholder="010-0000-0000"
                        value={phoneRaw}
                        onChange={(e) => setPhoneRaw(formatPhone(e.target.value))}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? "조회 중..." : "아이디 확인"}
                </Button>
              </form>

              {/* 서버가 마스킹 아이디를 준 경우 표시 */}
              {maskedId && (
                <div className="text-center text-sm text-muted-foreground">
                  회원님의 아이디: <span className="font-semibold text-foreground">{maskedId}</span>
                </div>
              )}

              <div className="relative">
                <Separator className="my-4" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                  또는
                </span>
              </div>

              <Button variant="ghost" className="w-full" onClick={() => navigate("/auth/login")}>
                로그인으로 돌아가기
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default FindIdPage;
