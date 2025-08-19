import { useEffect, useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const BanModal = ({ open, onClose, user, onSuccess }) => {
  const [reasonCode, setReasonCode] = useState("욕설");
  const [reasonDetail, setReasonDetail] = useState("");
  const [banDays, setBanDays] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const days = parseInt(banDays);
    if (!isNaN(days)) {
      const now = new Date();
      now.setDate(now.getDate() + days);
      setEndDate(now.toISOString().split("T")[0]);
    } else {
      setEndDate("");
    }
  }, [banDays]);

  const handleBan = async () => {
    if (!user) {
      console.warn("⚠️ 사용자 정보 없음");
      return;
    }

    const parsedBanDays = parseInt(banDays);
    const payload = {
      loginId: user.loginid,
      reasonCode,
      reasonDetail,
      banDays: isNaN(parsedBanDays) ? null : parsedBanDays,
      endDate: endDate?.trim() ? endDate : null,
    };

    console.log("🚀 정지 요청 보냄:", payload);

    try {
      const response = await axios.post("/api/admin/ban-user", payload, {
        withCredentials: true,
      });

      console.log("✅ 서버 응답:", response.data);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("❌ 정지 처리 실패", err);
      if (err.response) {
        console.error("❗ 서버 응답 에러:", err.response.data);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>블랙리스트 지정</DialogTitle>
          <DialogDescription>
            <strong>{user?.name}</strong> ({user?.email}) 사용자에게 블랙리스트 정지 처리를 적용합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <label className="block mb-1 text-sm font-medium">정지 사유 코드</label>
            <Input
              value={reasonCode}
              onChange={(e) => setReasonCode(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">상세 정지 사유</label>
            <Input
              value={reasonDetail}
              onChange={(e) => setReasonDetail(e.target.value)}
              placeholder="예: 욕설 및 비하 발언"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">정지 일수</label>
            <Input
              type="number"
              value={banDays}
              onChange={(e) => setBanDays(e.target.value)}
              min={1}
              max={365}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">정지 만료일</label>
            <Input value={endDate} readOnly />
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button variant="destructive" onClick={handleBan}>
            정지 적용
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BanModal;
