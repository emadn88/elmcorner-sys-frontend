"use client";

import { useState, useEffect } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";
import { Teacher } from "@/types/teachers";
import { TeacherService } from "@/lib/services/teacher.service";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface TeacherCredentialsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: Teacher | null;
}

export function TeacherCredentialsModal({
  open,
  onOpenChange,
  teacher,
}: TeacherCredentialsModalProps) {
  const { t } = useLanguage();
  const [credentials, setCredentials] = useState<{
    email: string;
    password: string;
    system_link: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (open && teacher) {
      fetchCredentials();
    } else {
      setCredentials(null);
      setError(null);
    }
  }, [open, teacher]);

  const fetchCredentials = async () => {
    if (!teacher) return;

    try {
      setIsLoading(true);
      setError(null);
      const creds = await TeacherService.getCredentials(teacher.id);
      setCredentials(creds);
    } catch (err: any) {
      setError(err.message || "Failed to fetch credentials");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const openSystemLink = () => {
    if (credentials?.system_link) {
      window.open(credentials.system_link, "_blank");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {t("teachers.viewCredentials") || "View Credentials"}
          </DialogTitle>
          <DialogDescription>
            {teacher?.user?.name
              ? `${t("teachers.credentialsFor") || "Credentials for"} ${teacher.user.name}`
              : t("teachers.teacherCredentials") || "Teacher credentials"}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <p className="font-medium">{error}</p>
          </div>
        ) : credentials ? (
          <div className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {t("teachers.email") || "Email"}
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md font-mono text-sm">
                  {credentials.email}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(credentials.email, "email")}
                  className="h-9 w-9"
                >
                  {copiedField === "email" ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {t("teachers.password") || "Password"}
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md font-mono text-sm">
                  {credentials.password}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(credentials.password, "password")}
                  className="h-9 w-9"
                >
                  {copiedField === "password" ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* System Link */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {t("teachers.systemLink") || "System Link"}
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm truncate">
                  {credentials.system_link}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(credentials.system_link, "link")}
                  className="h-9 w-9"
                >
                  {copiedField === "link" ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={openSystemLink}
                  className="h-9 w-9"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full"
              >
                {t("teachers.close") || "Close"}
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
