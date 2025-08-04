import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";

// 서버에서 내려주는 사용자 응답 타입
type ServerUser = {
  loginId?: string;
  nickname?: string;
  roles?: string[] | string;
};

// 프론트엔드에서 사용하는 사용자 타입
interface User {
  nickname: string;
  role: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  bootstrapped: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  bootstrapped: false,
  login: () => {},
  logout: async () => {},
});

// 쿠키 자동 전송 설정
axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [bootstrapped, setBootstrapped] = useState(false);

  // 서버 응답 → 프론트 사용자 객체 변환
  const mapServerUser = (data: ServerUser): User => {
	console.log("🟣 서버 응답:", data); // ← 여기에 추가
    const nickname = data.nickname?.trim();
    const loginId = data.loginId?.trim();

    const displayName =
      nickname && nickname.length > 0
        ? nickname
        : loginId && loginId.length > 0
          ? loginId
          : "사용자";

    let role = "";
    if (Array.isArray(data.roles)) role = data.roles[0] ?? "";
    else if (typeof data.roles === "string") role = data.roles;

    return { nickname: displayName, role };
  };
  // 최초 진입 시 로그인 상태 복원
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const res = await axios.get<ServerUser>("/api/user");
        setUser(mapServerUser(res.data));
        setIsLoggedIn(true);
		} catch (e: unknown) {
		  if (axios.isAxiosError(e) && e.response?.status === 401) {
		    setUser(null);
		    setIsLoggedIn(false);
		  } else {
		    console.error("초기 유저 상태 조회 실패:", e);
		    setUser(null);
		    setIsLoggedIn(false);
		  }
		} finally {
        setBootstrapped(true);
      }
    };
    bootstrap();
  }, []);

  // 로그인 성공 시 상태 반영
  const login = (u: User) => {
    setUser(u);
    setIsLoggedIn(true);
    setBootstrapped(true);
  };

  // 로그아웃: 서버 → 상태 초기화
  const logout = async () => {
    try {
      await axios.post("/api/logout");
    } catch (e) {
      console.error("로그아웃 실패(무시 가능):", e);
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
