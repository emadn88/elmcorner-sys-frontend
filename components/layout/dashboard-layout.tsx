"use client";

import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { SidebarProvider, useSidebar } from "@/contexts/sidebar-context";
import { useLanguage } from "@/contexts/language-context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { LoadingPage } from "@/components/ui/loading-page";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
}

function DashboardContent({ children }: { children: ReactNode }) {
  const { isOpen, isMounted } = useSidebar();
  const { direction } = useLanguage();

  if (!isMounted) {
    return <LoadingPage />;
  }

  const sidebarWidth = isOpen ? 256 : 80;

  // On mobile, sidebar overlays, so no margin needed
  // RTL-aware margin for desktop
  const marginStyle = direction === "rtl"
    ? { marginRight: `${sidebarWidth}px` }
    : { marginLeft: `${sidebarWidth}px` };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-emerald-50/30 to-gray-100 relative">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="layout-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <circle cx="40" cy="40" r="1.5" fill="#059669"/>
              <path d="M 0,40 Q 20,20 40,40 T 80,40" stroke="#059669" strokeWidth="0.5" fill="none"/>
              <path d="M 40,0 Q 20,20 40,40 T 40,80" stroke="#059669" strokeWidth="0.5" fill="none"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#layout-pattern)" />
        </svg>
      </div>
      <Sidebar />
      <div
        className={cn(
          "relative z-10 min-h-screen w-full",
          // On mobile: full width (sidebar overlays)
          // On desktop: account for sidebar width
          "md:transition-all"
        )}
        style={{
          // Desktop styles
          ...marginStyle,
          width: `calc(100% - ${sidebarWidth}px)`,
          transition: `${direction === "rtl" ? "margin-right" : "margin-left"} 0.3s ease-in-out, width 0.3s ease-in-out`,
        }}
        id="main-content"
      >
        <Header />
        <main className="w-full p-4 md:p-6 pt-16 md:pt-20">{children}</main>
      </div>
    </div>
  );
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <DashboardContent>{children}</DashboardContent>
      </SidebarProvider>
    </ProtectedRoute>
  );
}

