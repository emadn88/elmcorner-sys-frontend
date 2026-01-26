"use client";

import { useAuth } from "@/contexts/auth-context";

export function DebugPermissions() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-md z-50">
      <h3 className="font-bold mb-2">Debug: User Permissions</h3>
      <p>Role: {user.role}</p>
      <p>Permissions Count: {user.permissions?.length || 0}</p>
      <p>Has manage_users: {user.permissions?.includes("manage_users") ? "YES" : "NO"}</p>
      <p>Has manage_roles: {user.permissions?.includes("manage_roles") ? "YES" : "NO"}</p>
      <details className="mt-2">
        <summary className="cursor-pointer">All Permissions</summary>
        <pre className="mt-2 text-xs overflow-auto max-h-40">
          {JSON.stringify(user.permissions, null, 2)}
        </pre>
      </details>
    </div>
  );
}
