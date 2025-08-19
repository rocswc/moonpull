import React, { useEffect, useState } from "react";
import axios from "axios";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { initializeApp } from "firebase/app";

// ✅ Firebase 설정 (서비스워커에 있는 거랑 똑같이)
const firebaseConfig = {
  apiKey: "AIzaSyAef74zQ5OpMzYEPnjFb7QacrCFa_Z1_lg",
  authDomain: "moonpool-b2fc6.firebaseapp.com",
  projectId: "moonpool-b2fc6",
  storageBucket: "moonpool-b2fc6.appspot.com",
  messagingSenderId: "192091954185",
  appId: "1:192091954185:web:330c6b051ba21a049facd8",
};

// FCM 인스턴스
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

type Noti = {
  notificationId: number;
  message: string;
  createdAt: string;
  isRead: 0 | 1;
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<Noti[]>([]);

  // ✅ 알림 리스트 불러오기
  const load = async () => {
    const [cntRes, listRes] = await Promise.all([
      axios.get<number>("/api/admin/notifications/unread-count"),
      axios.get<Noti[]>("/api/admin/notifications?size=10"),
    ]);
    setUnread(cntRes.data);
    setItems(listRes.data);
  };

  // ✅ 알림 읽음 처리
  const markAsRead = async (id: number) => {
    await axios.post(`/api/admin/notifications/${id}/read`);
    await load();
  };

  const markAllAsRead = async () => {
    await axios.post(`/api/admin/notifications/read-all`);
    await load();
  };

  // ✅ 브라우저에서 FCM 토큰 요청 + 서버에 등록
  const requestPermissionAndRegisterToken = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.warn("❌ 알림 권한 거부됨");
        return;
      }

      const token = await getToken(messaging, {
        vapidKey: "너의-웹푸시-VAPID-키", // Firebase 콘솔 → Cloud Messaging → 키
      });

      console.log("✅ FCM Token:", token);

      // 서버에 저장 (userId는 세션 기반으로 서버가 알 수 있게)
      await axios.post("/api/fcm/register", { token });
    } catch (err) {
      console.error("FCM 토큰 등록 실패:", err);
    }
  };

  useEffect(() => {
    load();
    requestPermissionAndRegisterToken();

    // ✅ 포그라운드 알림 수신
    onMessage(messaging, (payload) => {
      console.log("📩 실시간 메시지:", payload);

      // UI 즉시 반영
      const newMsg = {
        notificationId: Date.now(), // 임시 ID
        message: payload.notification?.body || "새 알림",
        createdAt: new Date().toISOString(),
        isRead: 0,
      } as Noti;

      setItems((prev) => [newMsg, ...prev]);
      setUnread((prev) => prev + 1);
    });
  }, []);

  return (
    <div className="relative">
      <button
        className="relative rounded-full p-2 bg-black text-white"
        onClick={() => setOpen((v) => !v)}
        aria-label="알림"
      >
        🔔
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-popover border rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <span className="font-medium">알림</span>
            <button className="text-sm text-primary" onClick={markAllAsRead}>
              모두 읽음
            </button>
          </div>
          <div className="max-h-80 overflow-auto">
            {items.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">알림이 없습니다.</div>
            ) : (
              items.map((n) => (
                <div
                  key={n.notificationId}
                  className="px-3 py-2 border-b last:border-b-0"
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={`mt-1 w-2 h-2 rounded-full ${
                        n.isRead ? "bg-muted" : "bg-blue-500"
                      }`}
                    />
                    <div className="flex-1">
                      <div className="text-sm">{n.message}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </div>
                    {!n.isRead && (
                      <button
                        className="text-xs text-primary"
                        onClick={() => markAsRead(n.notificationId)}
                      >
                        읽음
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
