"use client";

import { useContext } from "react";
import { AuthContext } from "../context/Auth";
interface LoginResult {
  success: boolean;
  error?: string;
}

interface RegisterResult {
  success: boolean;
  error?: string;
}

interface UseAuthReturn {
  user: any;
  token: string | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
    remember?: boolean,
  ) => Promise<LoginResult>;
  register: (userData: any) => Promise<RegisterResult>;
  logout: () => void;
  isAuthenticated: boolean;
}

export function useAuth(): UseAuthReturn {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return {
    user: context.user,
    token: context.token,
    isLoading: context.loading,
    login: context.login,
    register: context.register,
    logout: context.logout,
    isAuthenticated: !!context.token,
  };
}
