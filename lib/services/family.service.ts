/**
 * Family Service
 * Service layer for family operations
 */

import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { Family, PaginatedResponse } from "@/lib/api/types";

export class FamilyService {
  /**
   * Get families list
   */
  static async getFamilies(filters: { search?: string; status?: string; per_page?: number } = {}): Promise<PaginatedResponse<Family>> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.per_page) params.append('per_page', filters.per_page.toString());

    const url = `${API_ENDPOINTS.ADMIN.FAMILIES}?${params.toString()}`;
    const response = await apiClient.get<Family[]>(url);

    if (response.status === "success") {
      return {
        data: response.data as any,
        current_page: (response as any).meta?.current_page || 1,
        last_page: (response as any).meta?.last_page || 1,
        per_page: (response as any).meta?.per_page || 15,
        total: (response as any).meta?.total || 0,
      };
    }

    throw new Error("Failed to fetch families");
  }

  /**
   * Search families for autocomplete
   */
  static async searchFamilies(query: string): Promise<Family[]> {
    const params = new URLSearchParams({ q: query });
    const url = `${API_ENDPOINTS.ADMIN.FAMILIES_SEARCH}?${params.toString()}`;
    const response = await apiClient.get<Family[]>(url);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    return [];
  }

  /**
   * Get single family
   */
  static async getFamily(id: number): Promise<Family> {
    const response = await apiClient.get<Family>(API_ENDPOINTS.ADMIN.FAMILY(id));

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch family");
  }

  /**
   * Create new family
   */
  static async createFamily(data: Partial<Family>): Promise<Family> {
    const response = await apiClient.post<Family>(API_ENDPOINTS.ADMIN.FAMILIES, data);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to create family");
  }

  /**
   * Update family
   */
  static async updateFamily(id: number, data: Partial<Family>): Promise<Family> {
    const response = await apiClient.put<Family>(API_ENDPOINTS.ADMIN.FAMILY(id), data);

    if (response.status === "success" && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to update family");
  }

  /**
   * Delete family
   */
  static async deleteFamily(id: number): Promise<void> {
    const response = await apiClient.delete(API_ENDPOINTS.ADMIN.FAMILY(id));

    if (response.status !== "success") {
      throw new Error(response.message || "Failed to delete family");
    }
  }
}
