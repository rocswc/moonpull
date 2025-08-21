// ✅ 전면 리팩토링된 NotificationBell (map 기반 처리 + 특수알림 포함)

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

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState([]);
  const [user, setUser] = useState(null);
  const scrollBoxRef = useRef(null);

  const loadUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get("/api/me", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setUser(res.data);
    } catch (err) {
      console.error("❌ 유저 정보 불러오기 실패:", err);
    }
  };

  const load = async () => {
    try {
      const [cntRes, listRes, spamRes] = await Promise.all([
        axios.get("/api/admin/notifications/unread-count"),
        axios.get("/api/admin/notifications?size=1000"),
        axios.get("/api/admin/spam-stats"),
      ]);

      const notifications = listRes.data.map((n) => {
        const createdAt =
          Array.isArray(n.createdAt) && n.createdAt.length >= 6
            ? new Date(...n.createdAt).toISOString()
            : typeof n.createdAt === "string"
            ? n.createdAt
            : new Date().toISOString();

        const type = n.message.includes("🚨 유저") && n.message.includes("신고")
          ? "ALERT"
          : "NORMAL";

        return { ...n, createdAt, type };
      });
	  console.log("🟠 spamRes.data 확인", spamRes.data);
      const spamItems = spamRes.data?.map((s) => ({
		
        notificationId: Math.floor(Math.random() * 1000000000), 
        message: s.message,
        createdAt: s.time,
        isRead: 0,
        type: "SPAM",
        spamInfo: s,
      })) || [];

      setItems([...spamItems, ...notifications]);
      setUnread(cntRes.data);
    } catch (err) {
      console.error("❌ 알림 불러오기 실패:", err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.post(`/api/admin/notifications/${id}/read`);
      setItems((prev) => prev.map((n) => n.notificationId === id ? { ...n, isRead: 1 } : n));
      setUnread((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("❌ 개별 알림 읽음 처리 실패", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post("/api/admin/notifications/read-all");
      setItems((prev) => prev.map((n) => ({ ...n, isRead: 1 })));
      setUnread(0);
    } catch (err) {
      console.error("❌ 전체 알림 읽음 처리 실패", err);
    }
  };

  const requestPermissionAndRegisterToken = async (user) => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const token = await getToken(messaging, {
        vapidKey: "BOnD3Ps-iZs-0h17or7HwRFS8S1xxpKFZvO7LFPZD0J43NtmPX_mLYitKUgHm9U8YjmEpF4e--OZlBE7crjpyL4",
      });
      if (!token) return;

      await axios.post(
        "/api/admin/fcm/register",
        { userId: user.userId, token },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        }
      );
    } catch (err) {
      console.error("❌ FCM 토큰 등록 실패:", err);
    }
  };

  useEffect(() => {
    loadUser();
    load();
    onMessage(messaging, (payload) => {
      const msg = payload.notification?.body || payload.data?.message || "새 알림";
      setItems((prev) => [{
        notificationId: Date.now(),
        message: msg,
        createdAt: new Date().toISOString(),
        isRead: 0,
        type: "NORMAL",
      }, ...prev]);
      setUnread((prev) => prev + 1);
    });

    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user) requestPermissionAndRegisterToken(user);
  }, [user]);

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
        <div className="absolute right-0 mt-2 w-96 max-h-[500px] overflow-y-auto bg-white border rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <span className="font-medium">📢 전체 알림</span>
            <button className="text-sm text-primary" onClick={markAllAsRead}>
              모두 읽음
            </button>
          </div>

          <div ref={scrollBoxRef} className="max-h-96 overflow-auto">
            {items.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">
                알림이 없습니다.
              </div>
            ) : (
              items.map((n) => {
                const date = new Date(n.createdAt).toLocaleString();
                return (
                  <div
                    key={n.notificationId}
                    className={`px-3 py-2 border-b last:border-b-0 ${n.isRead ? "bg-gray-100 text-gray-500 italic" : ""}`}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n.isRead ? "bg-gray-300" : "bg-blue-500"}`}
                      />
                      <div className="flex-1">
                        <div className="text-sm break-words whitespace-pre-wrap">
                          {n.type === "SPAM" ? `📛 ${n.message}` : n.message}
                        </div>
                        <div className="text-xs text-muted-foreground">{date}</div>
                        {n.type === "SPAM" && n.spamInfo && (
                          <ul className="mt-1 list-disc list-inside text-xs">
                            <li>보낸 사람: {n.spamInfo.sender}</li>
                            <li>횟수: {n.spamInfo.count}회</li>
                          </ul>
                        )}
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
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
