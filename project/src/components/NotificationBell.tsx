import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAef74zQ5OpMzYEPnjFb7QacrCFa_Z1_lg",
  authDomain: "moonpool-b2fc6.firebaseapp.com",
  projectId: "moonpool-b2fc6",
  storageBucket: "moonpool-b2fc6.appspot.com",
  messagingSenderId: "192091954185",
  appId: "1:192091954185:web:330c6b051ba21a049facd8",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

type Noti = {
  notificationId: number;
  message: string;
  createdAt: string;
  isRead: 0 | 1;
};

type User = {
  authenticated: boolean;
  loginId: string;
  userId: number;
  roles: string[];
  nickname: string;
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<Noti[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [lastReadId, setLastReadId] = useState<number | null>(null);
  const scrollBoxRef = useRef<HTMLDivElement>(null);

  const loadUser = async () => {
    try {
      const res = await axios.get<User>("/api/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        withCredentials: true,
      });
      setUser(res.data);
    } catch (err) {
      console.error("❌ 유저 정보 불러오기 실패:", err);
    }
  };

  const load = async () => {
    try {
      const [cntRes, listRes] = await Promise.all([
        axios.get<number>("/api/admin/notifications/unread-count"),
        axios.get<Noti[]>("/api/admin/notifications?size=10"),
      ]);
      setUnread(cntRes.data);
      setItems(listRes.data);
    } catch (err) {
      console.error("❌ 알림 불러오기 실패:", err);
    }
  };

  const markAsRead = async (id: number) => {
    await axios.post(`/api/admin/notifications/${id}/read`);
    const updated = items.map((item) =>
      item.notificationId === id ? { ...item, isRead: 1 } : item
    );
    setItems(updated);
    setUnread((prev) => Math.max(0, prev - 1));
    setLastReadId(id);
  };

  const markAllAsRead = async () => {
    await axios.post(`/api/admin/notifications/read-all`);
    const updated = items.map((item) => ({ ...item, isRead: 1 }));
    setItems(updated);
    setUnread(0);
  };

  const requestPermissionAndRegisterToken = async (user: User) => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const token = await getToken(messaging, {
        vapidKey:
          "BOnD3Ps-iZs-0h17or7HwRFS8S1xxpKFZvO7LFPZD0J43NtmPX_mLYitKUgHm9U8YjmEpF4e--OZlBE7crjpyL4",
      });

      await axios.post(
        "/api/admin/fcm/register",
        {
          userId: user.userId,
          token,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );
    } catch (err) {
      console.error("❌ FCM 토큰 등록 실패:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadUser();
      await load();
    };
    init();

    onMessage(messaging, (payload) => {
      const newMsg: Noti = {
        notificationId: Date.now(),
        message: payload.notification?.body || "새 알림",
        createdAt: new Date().toISOString(),
        isRead: 0,
      };
      setItems((prev) => [newMsg, ...prev]);
      setUnread((prev) => prev + 1);
    });
  }, []);

  useEffect(() => {
    if (user) {
      requestPermissionAndRegisterToken(user);
    }
  }, [user]);

  useEffect(() => {
    if (lastReadId !== null) {
      setTimeout(() => {
        scrollBoxRef.current?.scrollTo({ 
          top: scrollBoxRef.current.scrollHeight, 
          behavior: "smooth" 
        });
      }, 100);
      setLastReadId(null);
    }
  }, [items, lastReadId]);

  const sortedItems = [...items].sort((a, b) => a.isRead - b.isRead);

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
          <div ref={scrollBoxRef} id="noti-scroll-box" className="max-h-80 overflow-auto">
            {sortedItems.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">
                알림이 없습니다.
              </div>
            ) : (
              sortedItems.map((n) => (
                <div
                  key={n.notificationId}
                  className={`px-3 py-2 border-b last:border-b-0 ${
                    n.isRead ? "bg-gray-50 text-gray-400 italic" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                        n.isRead ? "bg-gray-300" : "bg-blue-500"
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