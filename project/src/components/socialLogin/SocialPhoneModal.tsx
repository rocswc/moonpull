// src/components/socialLogin/SocialPhoneModal.tsx
import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useNavigate } from "react-router-dom";

type Props = {
  provider: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

// 공통 axios 인스턴스
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : "/api",
  withCredentials: true,
});

export default function SocialPhoneModal({ provider, open, onOpenChange }: Props) {
  const [phoneRaw, setPhoneRaw] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const formatPhone = (d: string) => {
    const s = d.slice(0, 11);
    if (s.length <= 3) return s;
    if (s.length <= 7) return `${s.slice(0, 3)}-${s.slice(3)}`;
    return `${s.slice(0, 3)}-${s.slice(3, 7)}-${s.slice(7)}`;
  };

  const onChangePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
    setPhoneRaw(digits);
  };

  const handleCheckPhone = async () => {
    // ↓↓↓ 디버그: 클릭 들어오는지 먼저 확인
	console.log("[Modal] click");
	console.log("phoneRaw =", phoneRaw, "len =", phoneRaw.length);
	console.log("api baseURL =", api.defaults.baseURL);

    // alert("clicked"); // 필요하면 잠깐 켜서 확인

    const digits = phoneRaw;
    if (digits.length !== 11) {
      alert("전화번호 11자리를 입력하세요");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.get("/auth/check-phone", { params: { phone: digits } });
      const exists = Boolean(res.data?.exists);

      const qsIn = new URLSearchParams(window.location.search);
      const qsOut = new URLSearchParams();
      qsOut.set("provider", (qsIn.get("provider") || provider || "").toUpperCase());
      qsOut.set("socialId", qsIn.get("socialId") || "");
      qsOut.set("email", qsIn.get("email") || "");
      qsOut.set("name", qsIn.get("name") || "");
      qsOut.set("phone", digits);
      if (exists) qsOut.set("mode", "link");

      navigate(`/auth/social-join?${qsOut.toString()}`, { replace: true });
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      alert("전화번호 확인 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = phoneRaw.length === 11 && !submitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* ⚠️ DialogOverlay 지웠음 (shadcn이 기본 제공) */}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>전화번호 입력</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <Input
            placeholder="010-1234-5678"
            inputMode="numeric"
            value={formatPhone(phoneRaw)}
            onChange={onChangePhone}
            maxLength={13}
            onKeyDown={(e) => { if (e.key === "Enter" && canSubmit) handleCheckPhone(); }}
          />
        </div>

        <DialogFooter>
          {/* 디버그 중엔 disabled 잠깐 빼도 됨 */}
          <Button type="button" onClick={handleCheckPhone} disabled={!canSubmit}>
            {submitting ? "확인 중..." : "계속하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
