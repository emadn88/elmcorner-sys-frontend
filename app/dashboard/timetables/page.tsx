"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Calendar, 
  Pause, 
  Play, 
  Trash2, 
  Edit, 
  RefreshCw, 
  Clock, 
  User, 
  BookOpen, 
  MapPin,
  MoreVertical,
  CalendarDays,
  Search,
  X,
  Package,
  PackageCheck,
  PackageX
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Timetable, TimetableFilters, Package as PackageType } from "@/lib/api/types";
import { TimetableService } from "@/lib/services/timetable.service";
import { PackageService } from "@/lib/services/package.service";
import { TimetableFormModal } from "@/components/timetables/timetable-form-modal";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/language-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TimetablesPage() {
  const { t, direction } = useLanguage();
  const router = useRouter();
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [filteredTimetables, setFilteredTimetables] = useState<Timetable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTimetable, setEditingTimetable] = useState<Timetable | null>(null);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [generatingTimetable, setGeneratingTimetable] = useState<Timetable | null>(null);
  const [generateFromDate, setGenerateFromDate] = useState("");
  const [generateToDate, setGenerateToDate] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [studentPackages, setStudentPackages] = useState<Record<number, PackageType | null>>({});

  // Fetch timetables
  const fetchTimetables = async () => {
    try {
      setIsLoading(true);
      const response = await TimetableService.getTimetables({ per_page: 100 });
      setTimetables(response.data);
      setFilteredTimetables(response.data);
      
      // Fetch packages for all students
      const studentIds = [...new Set(response.data.map(t => t.student_id))];
      const packagesMap: Record<number, Package | null> = {};
      
      for (const studentId of studentIds) {
        try {
          const packagesResponse = await PackageService.getPackages({
            student_id: studentId,
            status: "active",
            per_page: 1,
          });
          // Get the first active package with remaining classes
          const activePackage = packagesResponse.data.find(
            (p: PackageType) => p.status === "active" && p.remaining_classes > 0
          );
          packagesMap[studentId] = activePackage || null;
        } catch (err) {
          packagesMap[studentId] = null;
        }
      }
      
      setStudentPackages(packagesMap);
    } catch (err: any) {
      console.error("Failed to fetch timetables:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate statistics
  const stats = {
    total: timetables.length,
    active: timetables.filter(t => t.status === "active").length,
    paused: timetables.filter(t => t.status === "paused").length,
    stopped: timetables.filter(t => t.status === "stopped").length,
  };

  // Filter timetables based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTimetables(timetables);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = timetables.filter((timetable) => {
      const studentName = timetable.student?.full_name?.toLowerCase() || "";
      const teacherName = timetable.teacher?.user?.name?.toLowerCase() || "";
      const courseName = timetable.course?.name?.toLowerCase() || "";
      
      return (
        studentName.includes(query) ||
        teacherName.includes(query) ||
        courseName.includes(query)
      );
    });
    
    setFilteredTimetables(filtered);
  }, [searchQuery, timetables]);

  useEffect(() => {
    fetchTimetables();
  }, []);

  const handleCreate = () => {
    setEditingTimetable(null);
    setIsFormOpen(true);
  };

  const handleEdit = (timetable: Timetable) => {
    setEditingTimetable(timetable);
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    await fetchTimetables();
    setIsFormOpen(false);
    setEditingTimetable(null);
  };

  const handlePause = async (id: number) => {
    try {
      await TimetableService.pauseTimetable(id);
      await fetchTimetables();
    } catch (err: any) {
      alert(err.message || "Failed to pause timetable");
    }
  };

  const handleResume = async (id: number) => {
    try {
      await TimetableService.resumeTimetable(id);
      await fetchTimetables();
    } catch (err: any) {
      alert(err.message || "Failed to resume timetable");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm(t("timetables.deleteConfirmation"))) {
      try {
        await TimetableService.deleteTimetable(id);
        await fetchTimetables();
      } catch (err: any) {
        alert(err.message || "Failed to delete timetable");
      }
    }
  };

  const handleGenerateClasses = async () => {
    if (!generatingTimetable || !generateFromDate || !generateToDate) return;

    try {
      setIsGenerating(true);
      await TimetableService.generateClasses(generatingTimetable.id, {
        from_date: generateFromDate,
        to_date: generateToDate,
      });
      setIsGenerateOpen(false);
      setGeneratingTimetable(null);
      setGenerateFromDate("");
      setGenerateToDate("");
      alert("Classes generated successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to generate classes");
    } finally {
      setIsGenerating(false);
    }
  };

  const openGenerateDialog = async (timetable: Timetable) => {
    // Check if student has active package
    try {
      const packagesResponse = await PackageService.getPackages({
        student_id: timetable.student_id,
        status: "active",
        per_page: 10,
      });
      
      const activePackage = packagesResponse.data.find(
        (p: Package) => p.status === "active" && p.remaining_classes > 0
      );
      
      if (!activePackage) {
        alert(t("timetables.noActivePackage") || "Student must have an active package with remaining classes before generating classes.");
        return;
      }
      
      setGeneratingTimetable(timetable);
      setGenerateFromDate(format(new Date(), "yyyy-MM-dd"));
      const threeMonthsLater = new Date();
      threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
      setGenerateToDate(format(threeMonthsLater, "yyyy-MM-dd"));
      setIsGenerateOpen(true);
    } catch (err: any) {
      alert(err.message || "Failed to check student package");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
      case "paused":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
      case "stopped":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return t("timetables.active");
      case "paused":
        return t("timetables.paused");
      case "stopped":
        return t("timetables.stopped");
      default:
        return status;
    }
  };

  const getDayName = (day: number) => {
    const days = direction === "rtl" 
      ? ["", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"]
      : ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    return days[day] || `Day ${day}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("timetables.pageTitle")}</h1>
          <p className="text-muted-foreground mt-1.5">{t("timetables.pageDescription")}</p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("timetables.createTimetable")}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("timetables.pageTitle") || "Total"}
              </p>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
            </div>
            <div className="p-2 rounded-lg bg-blue-500/10">
              <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("timetables.active") || "Active"}
              </p>
              <p className="text-2xl font-bold mt-1">{stats.active}</p>
            </div>
            <div className="p-2 rounded-lg bg-green-500/10">
              <Play className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("timetables.paused") || "Paused"}
              </p>
              <p className="text-2xl font-bold mt-1">{stats.paused}</p>
            </div>
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Pause className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("timetables.stopped") || "Stopped"}
              </p>
              <p className="text-2xl font-bold mt-1">{stats.stopped}</p>
            </div>
            <div className="p-2 rounded-lg bg-red-500/10">
              <X className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t("timetables.searchPlaceholder") || "Search by student or teacher..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTimetables.map((timetable) => (
            <motion.div
              key={timetable.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow duration-200 border-2 hover:border-primary/20">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge 
                        variant="outline" 
                        className={`${getStatusColor(timetable.status)} font-medium`}
                      >
                        {getStatusLabel(timetable.status)}
                      </Badge>
                      {studentPackages[timetable.student_id] ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 text-xs">
                          <PackageCheck className="h-3 w-3 mr-1" />
                          {t("timetables.hasPackage") || "Has Package"}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20 text-xs">
                          <PackageX className="h-3 w-3 mr-1" />
                          {t("timetables.noPackage") || "No Package"}
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-1">
                      {timetable.student?.full_name || "Student"}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {timetable.course?.name || "Course"}
                    </p>
                    {!studentPackages[timetable.student_id] && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 w-full"
                        onClick={() => router.push(`/dashboard/packages?student_id=${timetable.student_id}&create=true`)}
                      >
                        <Package className="h-3 w-3 mr-1" />
                        {t("timetables.createPackage") || "Create Package"}
                      </Button>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {timetable.status === "active" ? (
                        <DropdownMenuItem onClick={() => handlePause(timetable.id)}>
                          <Pause className="h-4 w-4 mr-2" />
                          {t("timetables.pause")}
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleResume(timetable.id)}>
                          <Play className="h-4 w-4 mr-2" />
                          {t("timetables.resume")}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => openGenerateDialog(timetable)}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        {t("timetables.generateClasses")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(timetable)}>
                        <Edit className="h-4 w-4 mr-2" />
                        {t("timetables.edit")}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDelete(timetable.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t("timetables.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Details */}
                <div className="space-y-4">
                  {/* Teacher */}
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-md bg-primary/10">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground mb-0.5">
                        {t("calendar.teacher")}
                      </p>
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {timetable.teacher?.user?.name || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Days */}
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-md bg-blue-500/10">
                      <CalendarDays className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground mb-1.5">
                        {t("timetables.days")}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {timetable.days_of_week.map((day) => (
                          <Badge 
                            key={day} 
                            variant="secondary" 
                            className="text-xs font-normal"
                          >
                            {getDayName(day)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-md bg-purple-500/10">
                      <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground mb-1.5">
                        {t("timetables.timeSlots")}
                      </p>
                      <div className="space-y-1">
                        {timetable.time_slots.map((slot, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs font-mono">
                              {slot.start} - {slot.end}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {getDayName(slot.day)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Timezones */}
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-md bg-orange-500/10">
                      <MapPin className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground mb-1.5">
                        {t("timetables.timezones")}
                      </p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {t("calendar.student")}:
                          </span>
                          <span className="text-xs font-medium text-foreground">
                            {timetable.student_timezone}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {t("calendar.teacher")}:
                          </span>
                          <span className="text-xs font-medium text-foreground">
                            {timetable.teacher_timezone}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}

          {filteredTimetables.length === 0 && (
            <div className="col-span-full">
              <Card className="p-12 text-center border-dashed">
                <div className="flex flex-col items-center justify-center">
                  <div className="p-4 rounded-full bg-muted mb-4">
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{t("timetables.noTimetables")}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get started by creating your first timetable
                  </p>
                  <Button onClick={handleCreate} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    {t("timetables.createTimetable")}
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      <TimetableFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        timetable={editingTimetable}
        onSave={handleSave}
      />

      <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
        <DialogContent dir={direction}>
          <DialogHeader>
            <DialogTitle>{t("timetables.generateClasses")}</DialogTitle>
            <DialogDescription>
              {t("timetables.generateClassesDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("timetables.fromDate")}</Label>
              <Input
                type="date"
                value={generateFromDate}
                onChange={(e) => setGenerateFromDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("timetables.toDate")}</Label>
              <Input
                type="date"
                value={generateToDate}
                onChange={(e) => setGenerateToDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGenerateOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleGenerateClasses} disabled={isGenerating}>
              {isGenerating ? t("timetables.generating") : t("timetables.generateClasses")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
