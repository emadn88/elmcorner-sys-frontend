"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Package } from "@/lib/api/types";
import { PackageService } from "@/lib/services/package.service";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PackageClassesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  package: Package | null;
}

interface ClassWithCounter {
  class: {
    id: number;
    class_date: string;
    start_time: string;
    end_time: string;
    duration: number;
    status: string;
    course?: { name: string };
    teacher?: { user?: { name: string } };
  };
  duration_hours: number;
  cumulative_hours: number;
  counter: number;
}

export function PackageClassesModal({
  open,
  onOpenChange,
  package: pkg,
}: PackageClassesModalProps) {
  const { t, direction } = useLanguage();
  const [classes, setClasses] = useState<ClassWithCounter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && pkg) {
      fetchClasses();
    } else {
      setClasses([]);
      setError(null);
    }
  }, [open, pkg]);

  const fetchClasses = async () => {
    if (!pkg) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await PackageService.getPackageClasses(pkg.id);
      setClasses(data);
    } catch (err: any) {
      setError(err.message || "Failed to load classes");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      attended: "bg-green-100 text-green-700 border-green-200",
      cancelled_by_student: "bg-red-100 text-red-700 border-red-200",
      cancelled_by_teacher: "bg-orange-100 text-orange-700 border-orange-200",
      absent_student: "bg-gray-100 text-gray-700 border-gray-200",
      waiting_list: "bg-blue-100 text-blue-700 border-blue-200",
    };

    return (
      <Badge
        variant="outline"
        className={cn("border", variants[status] || variants.pending)}
      >
        {t(`calendar.${status}`) || status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    // Handle both HH:mm:ss and HH:mm formats
    const time = timeString.split(":")[0] + ":" + timeString.split(":")[1];
    return time;
  };

  if (!pkg) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={cn("text-left rtl:text-right")}>
            {t("packages.packageClasses") || "Package Classes"}
          </DialogTitle>
          <DialogDescription className={cn("text-left rtl:text-right")}>
            {pkg.student?.full_name} - {t("packages.roundNumber")} {pkg.round_number}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        ) : classes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t("packages.noClassesFound") || "No classes found for this package"}
          </div>
        ) : (
          <div className="rounded-md border border-gray-200 bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead>{t("packages.counter") || "#"}</TableHead>
                  <TableHead>{t("calendar.date") || "Date"}</TableHead>
                  <TableHead>{t("calendar.time") || "Time"}</TableHead>
                  <TableHead>{t("packages.duration") || "Duration"}</TableHead>
                  <TableHead>{t("packages.cumulativeHours") || "Cumulative Hours"}</TableHead>
                  <TableHead>{t("calendar.status") || "Status"}</TableHead>
                  <TableHead>{t("calendar.course") || "Course"}</TableHead>
                  <TableHead>{t("calendar.teacher") || "Teacher"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((item, index) => (
                  <TableRow key={item.class.id}>
                    <TableCell className="font-medium">{item.counter}</TableCell>
                    <TableCell>{formatDate(item.class.class_date)}</TableCell>
                    <TableCell>
                      {formatTime(item.class.start_time)} - {formatTime(item.class.end_time)}
                    </TableCell>
                    <TableCell>{item.duration_hours.toFixed(2)}h</TableCell>
                    <TableCell>{item.cumulative_hours.toFixed(2)}h</TableCell>
                    <TableCell>{getStatusBadge(item.class.status)}</TableCell>
                    <TableCell>{item.class.course?.name || "-"}</TableCell>
                    <TableCell>{item.class.teacher?.user?.name || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
