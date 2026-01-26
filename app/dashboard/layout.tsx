import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DebugPermissions } from "@/components/debug-permissions";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout>
      {children}
      <DebugPermissions />
    </DashboardLayout>
  );
}

