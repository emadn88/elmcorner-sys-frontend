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
import { Collapsible } from "@/components/ui/collapsible";

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

interface RoundData {
  package: {
    id: number;
    round_number: number;
    total_hours: number;
    remaining_hours: number;
    status: 'active' | 'finished' | 'paid' | 'pending_package' | 'waiting_for_reactivation';
    start_date: string;
  };
  classes: ClassWithCounter[];
  total_classes: number;
  total_hours_used: number;
}

export function PackageClassesModal({
  open,
  onOpenChange,
  package: pkg,
}: PackageClassesModalProps) {
  const { t, direction } = useLanguage();
  const [rounds, setRounds] = useState<RoundData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && pkg) {
      fetchClasses();
    } else {
      setRounds([]);
      setError(null);
    }
  }, [open, pkg]);

  const fetchClasses = async () => {
    if (!pkg) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await PackageService.getPackageClasses(pkg.id);
      setRounds(data);
    } catch (err: any) {
      setError(err.message || "Failed to load classes");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: "bg-yellow-500 text-white border-yellow-600 dark:bg-yellow-600 dark:text-white",
      attended: "bg-emerald-500 text-white border-emerald-600 dark:bg-emerald-600 dark:text-white",
      cancelled_by_student: "bg-rose-500 text-white border-rose-600 dark:bg-rose-600 dark:text-white",
      cancelled_by_teacher: "bg-amber-500 text-white border-amber-600 dark:bg-amber-600 dark:text-white font-semibold",
      waiting_list: "bg-blue-500 text-white border-blue-600 dark:bg-blue-600 dark:text-white",
    };

    const label = status === 'cancelled_by_teacher' 
      ? (t("calendar.cancelledByTeacher") || t("calendar.cancelled_by_teacher") || "Cancelled by Teacher") + " ⚠️"
      : (t(`calendar.${status}`) || status);

    return (
      <Badge
        variant="outline"
        className={cn("border-2 font-medium", variants[status] || variants.pending)}
      >
        {label}
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
    const [hours, minutes] = timeString.split(":").map(Number);
    const hour12 = hours % 12 || 12;
    const ampm = hours >= 12 ? "PM" : "AM";
    const minutesStr = minutes.toString().padStart(2, "0");
    return `${hour12}:${minutesStr} ${ampm}`;
  };

  if (!pkg) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[95vw] lg:max-w-[1200px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={cn("text-left rtl:text-right")}>
            {t("packages.packageClasses") || "Package Classes"}
          </DialogTitle>
          <DialogDescription className={cn("text-left rtl:text-right")}>
            {pkg.student?.full_name}
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
        ) : rounds.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t("packages.noClassesFound") || "No classes found for this package"}
          </div>
        ) : (
          <div className="space-y-6">
            {rounds.map((round, roundIndex) => {
              const isFinished = round.package.status === "finished";
              const isPaid = round.package.status === "paid";
              
              const roundHeader = (
                <div className={cn(
                  "flex items-center justify-between w-full",
                  direction === "rtl" && "flex-row-reverse"
                )}>
                  <div className={cn("flex-1", direction === "rtl" && "text-right")}>
                    <h3 className="font-semibold text-lg">
                      {round.package.status === "pending_package" 
                        ? (t("packages.needsNewPackage") || "Needs New Package")
                        : round.package.status === "waiting_for_reactivation"
                        ? (t("packages.waitingForReactivation") || "New Package Waiting for Reactivation")
                        : `${t("packages.roundNumber") || "Round"} ${round.package.round_number}`
                      }
                      {round.package.status === "active" && (
                        <Badge className={cn("ml-2 rtl:mr-2 rtl:ml-0 bg-emerald-500 text-white")}>
                          {t("packages.active") || "Active"}
                        </Badge>
                      )}
                      {round.package.status === "finished" && (
                        <Badge className={cn("ml-2 rtl:mr-2 rtl:ml-0 bg-amber-500 text-white")}>
                          {t("packages.pendingPayment") || "Pending Payment"}
                        </Badge>
                      )}
                      {round.package.status === "paid" && (
                        <Badge variant="outline" className={cn("ml-2 rtl:mr-2 rtl:ml-0 bg-gray-100 text-gray-600 border-gray-300")}>
                          {t("packages.paid") || "Paid"}
                        </Badge>
                      )}
                      {round.package.status === "pending_package" && (
                        <Badge className={cn("ml-2 rtl:mr-2 rtl:ml-0 bg-orange-500 text-white")}>
                          {t("packages.overflow") || "Overflow"}
                        </Badge>
                      )}
                      {round.package.status === "waiting_for_reactivation" && (
                        <Badge className={cn("ml-2 rtl:mr-2 rtl:ml-0 bg-blue-500 text-white")}>
                          {t("packages.waiting") || "Waiting"}
                        </Badge>
                      )}
                    </h3>
                    <p className={cn("text-sm text-gray-600 dark:text-gray-400 mt-1", direction === "rtl" && "text-right")}>
                      {round.package.status === "pending_package" ? (
                        <>
                          {round.total_classes} {t("packages.classes") || "classes"} • {Number(round.total_hours_used).toFixed(2)}h {t("packages.needsPackage") || "needs new package"}
                        </>
                      ) : round.package.status === "waiting_for_reactivation" ? (
                        <>
                          {round.total_classes} {t("packages.classes") || "classes"} • {Number(round.total_hours_used).toFixed(2)}h {t("packages.waitingForReactivationDesc") || "waiting for package reactivation"}
                        </>
                      ) : (
                        <>
                          {Number(round.package.total_hours) || 0} {t("packages.hours") || "hours"} • 
                          {round.total_classes > 0 ? (
                            <> {round.total_classes} {t("packages.classes") || "classes"} • {Number(round.total_hours_used).toFixed(2)}h {t("packages.used") || "used"}</>
                          ) : (
                            <> {t("packages.noClasses") || "No classes"}</>
                          )}
                          {round.package.status === "active" && Number(round.package.remaining_hours) > 0 && (
                            <> • {Number(round.package.remaining_hours).toFixed(2)}h {t("packages.remaining") || "remaining"}</>
                          )}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              );

              const classesContent = round.classes.length > 0 ? (
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
                      {round.classes.map((item) => {
                        const isCancelledByTeacher = item.class.status === 'cancelled_by_teacher';
                        const countsTowardsLimit = (item as any).counts_towards_limit !== false;
                        
                        // Get row style based on status - using inline styles for maximum visibility
                        const getRowStyle = (status: string): React.CSSProperties => {
                          switch (status) {
                            case 'attended':
                              return { backgroundColor: '#6ee7b7', borderLeft: '5px solid #059669' }; // emerald
                            case 'cancelled_by_student':
                              return { backgroundColor: '#fda4af', borderLeft: '5px solid #e11d48' }; // rose
                            case 'cancelled_by_teacher':
                              return { backgroundColor: '#fcd34d', borderLeft: '5px solid #d97706' }; // amber
                            case 'pending':
                              return { backgroundColor: '#fef08a', borderLeft: '5px solid #ca8a04' }; // yellow
                            case 'waiting_list':
                              return { backgroundColor: '#93c5fd', borderLeft: '5px solid #2563eb' }; // blue
                            default:
                              return { backgroundColor: '#e5e7eb', borderLeft: '5px solid #6b7280' }; // gray
                          }
                        };
                        
                        return (
                          <TableRow 
                            key={item.class.id}
                            style={getRowStyle(item.class.status)}
                          >
                            <TableCell className="font-medium">
                              {item.counter === 0 && !isCancelledByTeacher ? (
                                <span className="text-gray-400">0</span>
                              ) : isCancelledByTeacher ? (
                                <span className="text-amber-600 dark:text-amber-400 font-semibold">-</span>
                              ) : (
                                item.counter.toFixed(2)
                              )}
                            </TableCell>
                            <TableCell>{formatDate(item.class.class_date)}</TableCell>
                            <TableCell>
                              {formatTime(item.class.start_time)} - {formatTime(item.class.end_time)}
                            </TableCell>
                            <TableCell>
                              {isCancelledByTeacher ? (
                                <span className="text-amber-600 dark:text-amber-400 line-through">
                                  {item.duration_hours.toFixed(2)}h
                                </span>
                              ) : (
                                `${item.duration_hours.toFixed(2)}h`
                              )}
                            </TableCell>
                            <TableCell>
                              {item.counter === 0 && !isCancelledByTeacher ? (
                                <span className="text-gray-400">-</span>
                              ) : isCancelledByTeacher ? (
                                <span className="text-amber-600 dark:text-amber-400">-</span>
                              ) : (
                                `${item.cumulative_hours.toFixed(2)}h`
                              )}
                            </TableCell>
                            <TableCell>{getStatusBadge(item.class.status)}</TableCell>
                            <TableCell>{item.class.course?.name || "-"}</TableCell>
                            <TableCell>{item.class.teacher?.user?.name || "-"}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500 text-sm">
                    {t("packages.noClassesInRound") || "No classes in this round"}
                  </div>
                );

              // Use Collapsible for paid rounds (collapsed by default), regular div for active/finished
              const isPaidRound = round.package.status === "paid";
              if (isPaidRound) {
                return (
                  <Collapsible
                    key={round.package.id}
                    defaultOpen={false}
                    trigger={roundHeader}
                    className={cn(
                      "rounded-md border border-gray-200 bg-white",
                      "bg-gray-50 dark:bg-gray-900/20"
                    )}
                  >
                    <div className="p-0">
                      {classesContent}
                    </div>
                  </Collapsible>
                );
              }

              return (
                <div key={round.package.id} className="rounded-md border border-gray-200 bg-white">
                  {/* Round Header */}
                  <div className={cn(
                    "px-4 py-3 border-b border-gray-200",
                    round.package.status === "active" 
                      ? "bg-emerald-50 dark:bg-emerald-900/20" 
                      : round.package.status === "finished"
                      ? "bg-amber-50 dark:bg-amber-900/20"  // Pending payment - amber/warning color
                      : round.package.status === "pending_package"
                      ? "bg-orange-50 dark:bg-orange-900/20"
                      : round.package.status === "waiting_for_reactivation"
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : "bg-gray-50 dark:bg-gray-900/20"
                  )}>
                    {roundHeader}
                  </div>

                  {/* Classes Table */}
                  {classesContent}
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
