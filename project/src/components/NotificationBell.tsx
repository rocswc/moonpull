import React, { useEffect, useState } from "react";
import axios from "axios";

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

  const load = async () => {
    const [cntRes, listRes] = await Promise.all([
      axios.get<number>("/api/admin/notifications/unread-count"),
      axios.get<Noti[]>("/api/admin/notifications?size=10"),
    ]);
    setUnread(cntRes.data);
    setItems(listRes.data);
  };

  const markAsRead = async (id: number) => {
    await axios.post(`/api/admin/notifications/${id}/read`);
    await load();
  };

  const markAllAsRead = async () => {
    await axios.post(`/api/admin/notifications/read-all`);
    await load();
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="relative">
      <button
        className="relative rounded-full p-2 hover:bg-muted"
        onClick={() => setOpen(v => !v)}
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
              items.map(n => (
                <div key={n.notificationId} className="px-3 py-2 border-b last:border-b-0">
                  <div className="flex items-start gap-2">
                    <div className={`mt-1 w-2 h-2 rounded-full ${n.isRead ? "bg-muted" : "bg-blue-500"}`} />
                    <div className="flex-1">
                      <div className="text-sm">{n.message}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </div>
                    {!n.isRead && (
                      <button className="text-xs text-primary" onClick={() => markAsRead(n.notificationId)}>
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
