// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";
import "@/lib/axiosConfig"; // ← 전역 설정(베이스URL, withCredentials, 401 핸들링, FormData 처리) '실행'만 하게 로드

// 서버에서 내려주는 사용자 응답 타입
type ServerUser = {
	userId?: number;
  loginId?: string;
  nickname?: string;
  roles?: string[] | string;
};



interface User {
	id: number;
  nickname: string;
  role: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  bootstrapped: boolean;
  login: (user: ServerUser) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  bootstrapped: false,
  login: () => {},
  logout: async () => {},
});

// ⚠️ 여기 있던 axios.defaults / interceptors 전부 삭제 (axiosConfig가 전역으로 처리함)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [bootstrapped, setBootstrapped] = useState(false);

  const mapServerUser = (data: ServerUser): User => {
    const nickname = data.nickname?.trim();
    const loginId = data.loginId?.trim();
    const displayName =
      nickname && nickname.length > 0 ? nickname : loginId && loginId.length > 0 ? loginId : "";

    let role = "";
    if (Array.isArray(data.roles)) {
      role = data.roles[0] ?? "";
    } else if (typeof data.roles === "string") {
      role = (data.roles.split(",")[0] ?? "").trim();
    }
    if (role.startsWith("ROLE_")) role = role.slice(5);

    return { id: data.userId ? Number(data.userId) : -1, nickname: displayName, role };
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const cfg = { headers: { "Cache-Control": "no-store" as const }, withCredentials: true as const };

        // /api/me 와 /api/user 를 동시에 호출 → 하나라도 200이면 사용
        const [meRes, userRes] = await Promise.allSettled([
          axios.get("/api/me", cfg),
          axios.get("/api/user", cfg),
        ]);

        let data: any = null;
        if (meRes.status === "fulfilled" && meRes.value?.status === 200) {
          data = meRes.value.data;
        } else if (userRes.status === "fulfilled" && userRes.value?.status === 200) {
          data = userRes.value.data;
        }

        // /api/me 형식({ authenticated: false|true, ...})도, /api/user 형식(바로 유저필드)도 처리
        const explicitlyUnauth =
          data && typeof data.authenticated === "boolean" && data.authenticated === false;

        if (!data || explicitlyUnauth) {
          setUser(null);
          setIsLoggedIn(false);
        } else {
          setUser(mapServerUser(data as any));
          setIsLoggedIn(true);
        }
		
      } catch {
        setUser(null);
        setIsLoggedIn(false);
      } finally {
        setBootstrapped(true);
      }
    };
    bootstrap();
  }, []);

  const login = (data: ServerUser) => {
    const u = mapServerUser(data);
    setUser(u);
    setIsLoggedIn(true);
    setBootstrapped(true);
  };

  const logout = async () => {
    try {
      // 백엔드 컨트롤러가 /api/logout 임
      await axios.post("/api/logout");
    } catch (e) {
      console.error("로그아웃 실패:", e);
    } finally {
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, bootstrapped, login, logout }}>
      {bootstrapped ? children : null}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
