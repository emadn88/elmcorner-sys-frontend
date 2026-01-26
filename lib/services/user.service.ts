/**
 * User Service
 * Service layer for user management operations
 */

import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import {
  UserManagement,
  UserFilters,
  PaginatedResponse,
  CreateUserData,
  UpdateUserData,
} from "@/lib/api/types";

export class UserService {
  /**
   * Get users list with filters and pagination
   */
  static async getUsers(filters: UserFilters = {}): Promise<PaginatedResponse<UserManagement>> {
    const params = new URLSearchParams();

    if (filters.search) params.append("search", filters.search);
    if (filters.role && filters.role !== "all") params.append("role", filters.role);
    if (filters.status && filters.status !== "all") params.append("status", filters.status);
    if (filters.per_page) params.append("per_page", filters.per_page.toString());
    if (filters.page) params.append("page", filters.page.toString());

    const url = `${API_ENDPOINTS.ADMIN.USERS}?${params.toString()}`;
    const response = await apiClient.get<UserManagement[]>(url);

    if (response.status === "success") {
      return {
        data: response.data as any,
        current_page: (response as any).meta?.current_page || 1,
        last_page: (response as any).meta?.last_page || 1,
        per_page: (response as any).meta?.per_page || 15,
        total: (response as any).meta?.total || 0,
      };
    }

    throw new Error("Failed to fetch users");
  }

  /**
   * Get user by ID
   */
  static async getUser(id: number): Promise<UserManagement> {
    const response = await apiClient.get<{ user: UserManagement }>(
      API_ENDPOINTS.ADMIN.USER(id)
    );

    if (response.status === "success" && response.data) {
      return response.data as any;
    }

    throw new Error("Failed to fetch user");
  }

  /**
   * Create a new user
   */
  static async createUser(data: CreateUserData): Promise<UserManagement> {
    const response = await apiClient.post<UserManagement>(
      API_ENDPOINTS.ADMIN.USERS,
      data
    );

    if (response.status === "success" && response.data) {
      return response.data as any;
    }

    throw new Error(response.message || "Failed to create user");
  }

  /**
   * Update user
   */
  static async updateUser(id: number, data: UpdateUserData): Promise<UserManagement> {
    const response = await apiClient.put<UserManagement>(
      API_ENDPOINTS.ADMIN.USER(id),
      data
    );

    if (response.status === "success" && response.data) {
      return response.data as any;
    }

    throw new Error(response.message || "Failed to update user");
  }

  /**
   * Delete user
   */
  static async deleteUser(id: number): Promise<void> {
    const response = await apiClient.delete(API_ENDPOINTS.ADMIN.USER(id));

    if (response.status !== "success") {
      throw new Error(response.message || "Failed to delete user");
    }
  }

  /**
   * Update user status
   */
  static async updateUserStatus(id: number, status: 'active' | 'inactive'): Promise<UserManagement> {
    const response = await apiClient.put<UserManagement>(
      API_ENDPOINTS.ADMIN.USER_STATUS(id),
      { status }
    );

    if (response.status === "success" && response.data) {
      return response.data as any;
    }

    throw new Error(response.message || "Failed to update user status");
  }
}
