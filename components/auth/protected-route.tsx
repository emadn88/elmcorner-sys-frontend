"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { LoadingPage } from "@/components/ui/loading-page";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
}

export function ProtectedRoute({
  children,
  requiredPermission,
  requiredRole,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Check permission if required
  if (requiredPermission && user && !user.permissions?.includes(requiredPermission)) {
    router.push("/dashboard");
    return null;
  }

  // Check role if required
  if (requiredRole && user && user.role !== requiredRole) {
    router.push("/dashboard");
    return null;
  }

  // Show loading while checking authentication
  if (isLoading) {
    return <LoadingPage />;
  }

  // Show loading if not authenticated (will redirect)
  if (!isAuthenticated) {
    return <LoadingPage />;
  }

  return <>{children}</>;
}
