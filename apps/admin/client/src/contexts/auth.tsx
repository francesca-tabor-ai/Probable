import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as authApi from "@/lib/auth-api";

interface AuthState {
  user: authApi.User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<authApi.User | null>(null);
  const [token, setToken] = useState<string | null>(() => authApi.getAuthToken());
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    authApi.clearAuthToken();
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { access_token } = await authApi.login({ email, password });
    authApi.setAuthToken(access_token);
    setToken(access_token);
    const me = await authApi.getMe(access_token);
    setUser(me);
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    await authApi.signUp({ email, password, full_name: fullName });
    await login(email, password);
  }, [login]);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    authApi
      .getMe(token)
      .then(setUser)
      .catch(() => {
        logout();
      })
      .finally(() => setIsLoading(false));
  }, [token, logout]);

  const value: AuthContextValue = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    signUp,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
