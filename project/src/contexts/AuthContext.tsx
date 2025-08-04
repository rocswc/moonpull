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
  login: (user: ServerUser) => void;  // ✅ 타입 변경
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
    const nickname = data.nickname?.trim();
    const loginId = data.loginId?.trim();

    const displayName =
      nickname && nickname.length > 0
        ? nickname
        : loginId && loginId.length > 0
          ? loginId
          : "";

    let role = "";
    if (Array.isArray(data.roles)) role = data.roles[0] ?? "";
    else if (typeof data.roles === "string") role = data.roles;

    return { nickname: displayName, role };
  };

  // ✅ login 함수 하나로 통일
  const login = (data: ServerUser) => {
    const user = mapServerUser(data);
    setUser(user);
    setIsLoggedIn(true);
    setBootstrapped(true);
  };

  // 최초 진입 시 로그인 상태 복원
  useEffect(() => {
    const bootstrap = async () => {
      try {

        const res = await axios.get<ServerUser>("/api/user", {
          headers: { "Cache-Control": "no-store" },
        });
 
        setUser(mapServerUser(res.data));
        setIsLoggedIn(true);
      } catch (e) {
   
        setUser(null);
        setIsLoggedIn(false);
      } finally {
 
        setBootstrapped(true);
      }
    };

    bootstrap();
  }, []);

  // 로그아웃
  const logout = async () => {
    try {
      await axios.post("/api/logout");
    } 	  	  catch (e) {
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
