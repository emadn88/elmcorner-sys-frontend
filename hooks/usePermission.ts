import { useAuth } from "@/contexts/auth-context";

/**
 * Hook to check if the current user has a specific permission
 * @param permission - The permission name to check
 * @returns boolean indicating if the user has the permission
 */
export function usePermission(permission: string): boolean {
  const { user } = useAuth();

  if (!user || !user.permissions) {
    return false;
  }

  return user.permissions.includes(permission);
}

/**
 * Hook to check if the current user has any of the specified permissions
 * @param permissions - Array of permission names to check
 * @returns boolean indicating if the user has at least one of the permissions
 */
export function useAnyPermission(permissions: string[]): boolean {
  const { user } = useAuth();

  if (!user || !user.permissions) {
    return false;
  }

  return permissions.some((permission) => user.permissions?.includes(permission));
}

/**
 * Hook to check if the current user has all of the specified permissions
 * @param permissions - Array of permission names to check
 * @returns boolean indicating if the user has all of the permissions
 */
export function useAllPermissions(permissions: string[]): boolean {
  const { user } = useAuth();

  if (!user || !user.permissions) {
    return false;
  }

  return permissions.every((permission) => user.permissions?.includes(permission));
}

/**
 * Hook to check if the current user has a specific role
 * @param role - The role name to check
 * @returns boolean indicating if the user has the role
 */
export function useRole(role: string): boolean {
  const { user } = useAuth();

  if (!user) {
    return false;
  }

  return user.role === role;
}
