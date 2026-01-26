/**
 * Role Service
 * Service layer for role management operations
 */

import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import {
  RoleWithPermissions,
  PagePermissionMapping,
  PermissionsResponse,
  CreateRoleData,
  UpdateRoleData,
  SyncPermissionsData,
} from "@/lib/api/types";

export class RoleService {
  /**
   * Get all roles
   */
  static async getRoles(): Promise<RoleWithPermissions[]> {
    const response = await apiClient.get<RoleWithPermissions[]>(
      API_ENDPOINTS.ADMIN.ROLES
    );

    if (response.status === "success" && response.data) {
      return response.data as any;
    }

    throw new Error("Failed to fetch roles");
  }

  /**
   * Get role by ID
   */
  static async getRole(id: number): Promise<RoleWithPermissions> {
    const response = await apiClient.get<{ role: RoleWithPermissions }>(
      API_ENDPOINTS.ADMIN.ROLE(id)
    );

    if (response.status === "success" && response.data) {
      return response.data as any;
    }

    throw new Error("Failed to fetch role");
  }

  /**
   * Create a new role
   */
  static async createRole(data: CreateRoleData): Promise<RoleWithPermissions> {
    const response = await apiClient.post<RoleWithPermissions>(
      API_ENDPOINTS.ADMIN.ROLES,
      data
    );

    if (response.status === "success" && response.data) {
      return response.data as any;
    }

    throw new Error(response.message || "Failed to create role");
  }

  /**
   * Update role
   */
  static async updateRole(id: number, data: UpdateRoleData): Promise<RoleWithPermissions> {
    const response = await apiClient.put<RoleWithPermissions>(
      API_ENDPOINTS.ADMIN.ROLE(id),
      data
    );

    if (response.status === "success" && response.data) {
      return response.data as any;
    }

    throw new Error(response.message || "Failed to update role");
  }

  /**
   * Delete role
   */
  static async deleteRole(id: number): Promise<void> {
    const response = await apiClient.delete(API_ENDPOINTS.ADMIN.ROLE(id));

    if (response.status !== "success") {
      throw new Error(response.message || "Failed to delete role");
    }
  }

  /**
   * Sync permissions for a role
   */
  static async syncPermissions(id: number, data: SyncPermissionsData): Promise<RoleWithPermissions> {
    const response = await apiClient.post<RoleWithPermissions>(
      API_ENDPOINTS.ADMIN.ROLE_PERMISSIONS(id),
      data
    );

    if (response.status === "success" && response.data) {
      return response.data as any;
    }

    throw new Error(response.message || "Failed to update permissions");
  }

  /**
   * Get all available permissions grouped by module
   */
  static async getPermissions(): Promise<PermissionsResponse> {
    const response = await apiClient.get<PermissionsResponse>(
      API_ENDPOINTS.ADMIN.ROLES_PERMISSIONS_ALL
    );

    if (response.status === "success" && response.data) {
      return response.data as any;
    }

    throw new Error("Failed to fetch permissions");
  }

  /**
   * Get page to permission mapping
   */
  static async getPagePermissions(): Promise<PagePermissionMapping> {
    const response = await apiClient.get<PagePermissionMapping>(
      API_ENDPOINTS.ADMIN.ROLES_PAGES_PERMISSIONS
    );

    if (response.status === "success" && response.data) {
      return response.data as any;
    }

    throw new Error("Failed to fetch page permissions");
  }
}
