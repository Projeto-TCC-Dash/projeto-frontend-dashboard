"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import type { User, AuthResponse, AuthCredentialsDTO } from "@/src/types/api";
import {
  apiClient,
  getStoredToken,
  setStoredToken,
  getStoredUser,
  setStoredUser,
  clearStoredAuth,
} from "@/lib/api-client";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: AuthCredentialsDTO) => Promise<AuthResponse>;
  register: (credentials: AuthCredentialsDTO) => Promise<AuthResponse>;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [token, setToken] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  // Hidrata a sessão do localStorage no client-side mount
  React.useEffect(() => {
    try {
      const storedToken = getStoredToken();
      const storedUser = getStoredUser<User>();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = React.useCallback(
    async (credentials: AuthCredentialsDTO): Promise<AuthResponse> => {
      const data = await apiClient.post<AuthResponse>("/api/auth/login", credentials);
      setStoredToken(data.token);
      setStoredUser(data.user);
      setToken(data.token);
      setUser(data.user);
      queryClient.setQueryData(["user"], data.user);
      return data;
    },
    [queryClient]
  );

  const register = React.useCallback(
    async (credentials: AuthCredentialsDTO): Promise<AuthResponse> => {
      const data = await apiClient.post<AuthResponse>("/api/auth/register", credentials);
      setStoredToken(data.token);
      setStoredUser(data.user);
      setToken(data.token);
      setUser(data.user);
      queryClient.setQueryData(["user"], data.user);
      return data;
    },
    [queryClient]
  );

  const updateUser = React.useCallback(
    (updates: Partial<User>) => {
      setUser((prev) => {
        if (!prev) return null;
        const updated = { ...prev, ...updates };
        setStoredUser(updated);
        queryClient.setQueryData(["user"], updated);
        return updated;
      });
    },
    [queryClient]
  );

  const logout = React.useCallback(() => {
    clearStoredAuth();
    setToken(null);
    setUser(null);
    queryClient.clear();
    router.push("/login");
  }, [queryClient, router]);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading,
      login,
      register,
      updateUser,
      logout,
    }),
    [user, token, isLoading, login, register, updateUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser utilizado dentro de um <AuthProvider>");
  }
  return context;
}
