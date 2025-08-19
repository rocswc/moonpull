// src/fcm.tsx
import { useEffect } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "./firebase";
import { useAuth } from "@/contexts/AuthContext";

interface UseFcmOptions {
  currentUser: { id: number | string };
  onNotification?: (payload: any) => void;
}

export function useFcm({ currentUser, onNotification }: UseFcmOptions) {
  const { user } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const registerFcmToken = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.warn("알림 권한 거부됨");
          return;
        }

        if (!messaging) {
          console.warn("🔥 messaging이 초기화되지 않았습니다.");
          return;
        }

        const token = await getToken(messaging, {
          vapidKey:
            "BOnD3Ps-iZs-0h17or7HwRFS8S1xxpKFZvO7LFPZD0J43NtmPX_mLYitKUgHm9U8YjmEpF4e--OZlBE7crjpyL4",
        });

        if (!token) {
          console.warn("❌ 토큰을 가져오지 못했음");
          return;
        }

        console.log("✅ FCM Token:", token);

        await fetch("/api/admin/fcm/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user ? Number(user.id) : 0, // 🔥 user.id 안전 변환
            token: token ?? "",
          }),
        });
      } catch (err) {
        console.error("❌ FCM 등록 실패:", err);
      }
    };

    registerFcmToken();

    // ✅ Foreground 메시지 수신 핸들러
    const handleMessage = (payload: any) => {
      console.log("📩 Foreground 메시지 도착:", payload);
      if (onNotification) {
        onNotification(payload);
      } else {
        const { title, body } = payload.notification || {};
        if (title || body) {
          alert(`${title ?? "새 알림"}\n${body ?? ""}`);
        }
      }
    };

    if (messaging) {
      const unsubscribe = onMessage(messaging, handleMessage);
      return () => unsubscribe(); // ✅ cleanup 추가
    } else {
      console.warn("🔥 messaging이 null이라 onMessage 핸들러를 등록할 수 없음.");
    }
  }, [currentUser, user]); // ✅ user도 deps에 추가
}
