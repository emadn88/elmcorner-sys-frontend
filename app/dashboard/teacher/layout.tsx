import { ProtectedRoute } from "@/components/auth/protected-route";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute requiredRole="teacher">{children}</ProtectedRoute>;
}
