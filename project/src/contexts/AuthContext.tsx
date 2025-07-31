import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios"; // 🔹 axios 추가
import Cookies from "js-cookie";

//  User 타입 정의
interface User {
  nickname: string;
  role: string;
}

//  Context 타입 정의
interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (nickname: string, role: string) => void;
  logout: () => void;
}

// Context 생성 (기본값 설정)
const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!Cookies.get("jwt"));
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setIsLoggedIn(!!Cookies.get("jwt"));
  }, []);

  // 로그인 성공 시 nickname과 role 저장
  const login = (nickname: string, role: string) => {
    setIsLoggedIn(true);
    setUser({ nickname, role });
  };

  // 로그아웃 시 서버 호출 + 상태 초기화
  const logout = async () => {
    try {
      await axios.post("/api/logout", {}, { withCredentials: true }); // 🔹 서버로 요청 보내 쿠키 삭제
    } catch (error) {
      console.error("로그아웃 요청 실패", error);
    }
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
