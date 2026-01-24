/**
 * Auth Service
 * Service layer for authentication operations
 */

import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { LoginRequest, LoginResponse, User } from "@/lib/api/types";

export class AuthService {
  /**
   * Login with email and password
   */
  static async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      { email, password } as LoginRequest
    );

    if (response.status === "success" && response.data) {
      // Store tokens
      apiClient.setTokens(
        response.data.access_token,
        response.data.refresh_token
      );
    }

    return response.data;
  }

  /**
   * Logout current user
   */
  static async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Continue with logout even if API call fails
      console.error("Logout API error:", error);
    } finally {
      apiClient.clearTokens();
    }
  }

  /**
   * Get current authenticated user
   */
  static async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<{ user: User }>(API_ENDPOINTS.AUTH.ME);

    if (response.status === "success" && response.data?.user) {
      return response.data.user;
    }

    throw new Error("Failed to fetch current user");
  }

  /**
   * Refresh access token
   */
  static async refreshToken(): Promise<string> {
    const refreshToken = typeof window !== "undefined"
      ? localStorage.getItem("refresh_token")
      : null;

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await apiClient.post<{ access_token: string }>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refresh_token: refreshToken }
    );

    if (response.status === "success" && response.data?.access_token) {
      apiClient.setTokens(response.data.access_token);
      return response.data.access_token;
    }

    throw new Error("Failed to refresh token");
  }
}
