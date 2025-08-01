import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

// User 타입 정의
interface User {
  nickname: string;
  role: string;
}

interface JwtPayload {
  nickname: string;
  role?: string;
  roles?: string | string[];
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (nickname: string, role: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!Cookies.get("jwt"));
  const [user, setUser] = useState<User | null>(null);

  // JWT에서 유저 정보 복구
  const getUserFromJwt = () => {
    const token = Cookies.get("jwt");
    if (!token) return null;
    try {
      const payload = jwtDecode<JwtPayload>(token);
	  console.log("jwt payload", payload);
	  
      // roles가 배열 또는 string일 수 있음
      let role = "";
      if (Array.isArray(payload.roles)) role = payload.roles[0];
      else if (typeof payload.roles === "string") role = payload.roles;
      else if (payload.role) role = payload.role;
      return {
        nickname: payload.nickname,
        role,
      };
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const userFromToken = getUserFromJwt();
	console.log("쿠키에서 읽은 userFromToken", userFromToken);
    if (userFromToken) {
      setUser(userFromToken);
      setIsLoggedIn(true);
    } else {
      setUser(null);
      setIsLoggedIn(false);
    }
  }, []);

  // 로그인(수동)
  const login = (nickname: string, role: string) => {
    setIsLoggedIn(true);
    setUser({ nickname, role });
  };

  // 로그아웃
  const logout = async () => {
    try {
      await axios.post("/api/logout", {}, { withCredentials: true });
	  Cookies.remove("jwt");
    } 	  catch (error) {
	    console.error(error);
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
