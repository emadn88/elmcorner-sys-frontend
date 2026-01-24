"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, LoginRequest, LoginResponse } from "@/lib/api/types";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<string>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Fetch current user
      await refreshUser();
    } catch (error) {
      // Token invalid or expired
      apiClient.clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log("Attempting login to:", API_ENDPOINTS.AUTH.LOGIN);
      const response = await apiClient.post<LoginResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        { email, password }
      );

      console.log("Login response:", response);

      if (response.status === "success" && response.data) {
        // Store tokens
        apiClient.setTokens(
          response.data.access_token,
          response.data.refresh_token
        );

        // Fetch user data
        await refreshUser();

        // Return redirect URL if provided
        return response.data.redirect_url || '/dashboard';
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error: any) {
      // Error is already formatted by API client
      console.error("Login error details:", {
        message: error?.message,
        error: error,
        stack: error?.stack,
      });
      const errorMessage = error?.message || "Invalid email or password. Please try again.";
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      // Call logout API
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Continue with logout even if API call fails
      console.error("Logout API error:", error);
    } finally {
      // Clear tokens and user state
      apiClient.clearTokens();
      setUser(null);
      
      // Redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  };

  const refreshUser = async () => {
    try {
      const response = await apiClient.get<{ user: User }>(API_ENDPOINTS.AUTH.ME);
      
      if (response.status === "success" && response.data?.user) {
        setUser(response.data.user);
      } else {
        throw new Error("Failed to fetch user");
      }
    } catch (error) {
      // Clear tokens if user fetch fails
      apiClient.clearTokens();
      setUser(null);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
