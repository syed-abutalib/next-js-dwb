// context/AuthContext.tsx
"use client";

import axios from "axios";
import { createContext, useEffect, useState, useCallback, ReactNode } from "react";
import toast from "react-hot-toast";
import { apiUrl } from "@/components/common/Config";
import { useRouter } from "next/navigation";

// Types
interface User {
  _id: string;
  name: string;
  username?: string;
  email: string;
  role: "user" | "admin" | "editor";
  avatar?: string;
  bio?: string;
  createdAt?: string;
}

interface LoginResponse {
  success: boolean;
  user: User;
  token: string;
  message?: string;
}

interface RegisterResponse {
  success: boolean;
  user: User;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<{ success: boolean; user?: User }>;
  logout: () => void;
  register: (userData: Partial<User> & { password: string }) => Promise<{ success: boolean; user?: User }>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  updateUser: (userData: Partial<User>) => void;
}

// Safe localStorage utilities
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  },
};

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true when component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize auth state from localStorage
  useEffect(() => {
    if (!isClient) return;

    const initializeAuth = () => {
      try {
        const savedToken = safeLocalStorage.getItem("token");
        const savedUser = safeLocalStorage.getItem("user");

        if (savedToken && savedUser) {
          const parsedUser = JSON.parse(savedUser) as User;
          setUser(parsedUser);
          setToken(savedToken);
          
          // Set axios default header
          axios.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        // Clear invalid data
        safeLocalStorage.removeItem("token");
        safeLocalStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [isClient]);

  // Login function
  const login = useCallback(async (email: string, password: string, remember: boolean = false) => {
    setLoading(true);
    try {
      const response = await axios.post<LoginResponse>(`${apiUrl}/auth/login`, {
        email,
        password,
      });

      const { success, user: userData, token: jwtToken, message } = response.data;

      if (!success || !userData || !jwtToken) {
        throw new Error(message || "Login failed");
      }

      // Store user data and token
      setUser(userData);
      setToken(jwtToken);

      // Store in localStorage
      safeLocalStorage.setItem("user", JSON.stringify(userData));
      safeLocalStorage.setItem("token", jwtToken);

      // Set axios default header
      axios.defaults.headers.common["Authorization"] = `Bearer ${jwtToken}`;

      // Show success message
      toast.success(
        userData.role === "admin" 
          ? "Welcome back, Admin!" 
          : "Login successful! Welcome back."
      );

      // Navigate based on role
      if (userData.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }

      return { success: true, user: userData };
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message || 
        error.message || 
        "Login failed. Please check your credentials.";
      
      toast.error(errorMessage);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Logout function
  const logout = useCallback(() => {
    // Clear state
    setUser(null);
    setToken(null);
    
    // Clear localStorage
    safeLocalStorage.removeItem("token");
    safeLocalStorage.removeItem("user");
    
    // Clear axios header
    delete axios.defaults.headers.common["Authorization"];
    
    // Show message and redirect
    toast.success("Logged out successfully");
    router.push("/login");
  }, [router]);

  // Register function
  const register = useCallback(async (userData: Partial<User> & { password: string }) => {
    setLoading(true);
    try {
      const response = await axios.post<RegisterResponse>(`${apiUrl}/auth/register`, userData);

      const { success, user: newUser, message } = response.data;

      if (!success || !newUser) {
        throw new Error(message || "Registration failed");
      }

      toast.success("Account created successfully! Please login.");
      router.push("/login");

      return { success: true, user: newUser };
    } catch (error: any) {
      console.error("Registration error:", error);
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err: any) => {
          toast.error(err.msg);
        });
      } else {
        const errorMessage =
          error.response?.data?.message || 
          error.message || 
          "Registration failed. Please try again.";
        
        toast.error(errorMessage);
      }
      
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Update user data
  const updateUser = useCallback((userData: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    safeLocalStorage.setItem("user", JSON.stringify(updatedUser));
  }, [user]);

  // Check if user is authenticated
  const isAuthenticated = !!token && !!user;

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  // Auto-refresh token or revalidate
  useEffect(() => {
    if (!token || !isClient) return;

    // Optional: Add token refresh logic here
    // You could set up an interval to refresh the token
    // or validate the token on certain intervals

  }, [token, isClient]);

  // If not client yet, show nothing or loader
  if (!isClient) {
    return null; // or a loading spinner
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        register,
        updateUser,
        isAuthenticated,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};