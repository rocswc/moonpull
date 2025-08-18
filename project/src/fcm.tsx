// src/fcm.tsx
import { useEffect } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "./firebase";

interface UseFcmOptions {
  currentUser: { id: number | string };
  onNotification?: (payload: any) => void; // 알림 도착 시 실행할 콜백
}

export function useFcm({ currentUser, onNotification }: UseFcmOptions) {
  useEffect(() => {
    const registerFcmToken = async () => {
      try {
        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
          console.warn("알림 권한 거부됨");
          return;
        }

        // FCM 토큰 요청
        const token = await getToken(messaging, {
          vapidKey:
            "BOnD3Ps-iZs-0h17or7HwRFS8S1xxpKFZvO7LFPZD0J43NtmPX_mLYitKUgHm9U8YjmEpF4e--OZlBE7crjpyL4",
        });

        if (!token) {
          console.warn("❌ 토큰을 가져오지 못했음");
          return;
        }

        console.log("✅ FCM Token:", token);

        // 서버(Spring)로 전송
        await fetch("/api/admin/fcm/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, userId: currentUser.id }),
        });
      } catch (err) {
        console.error("❌ FCM 등록 실패:", err);
      }
    };

    // 최초 등록
    registerFcmToken();

    // Foreground 메시지 리스너
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("📩 Foreground 메시지 도착:", payload);
      if (onNotification) {
        onNotification(payload);
      } else {
        alert(payload.notification?.title || "새 알림!");
      }
    });

    // cleanup
    return () => {
      unsubscribe();
    };
  }, [currentUser, onNotification]);
}
