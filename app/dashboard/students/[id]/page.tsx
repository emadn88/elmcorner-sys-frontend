"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Edit,
  User,
  Package,
  Calendar,
  BookOpen,
  DollarSign,
  ClipboardList,
  FileText,
  Activity,
  Mail,
  Phone,
  MapPin,
  Globe,
  Clock,
  Tag,
  FileEdit,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingPage } from "@/components/ui/loading-page";
import { StudentService } from "@/lib/services/student.service";
import { StudentProfile } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";
import { StudentFormModal } from "@/components/students/student-form-modal";
import { getTimezoneByIdentifier } from "@/lib/timezones";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

type TabId = "overview" | "packages" | "classes" | "bills" | "duties" | "reports" | "activity";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { t, direction } = useLanguage();
  const studentId = Number(params.id);

  const tabs: { id: TabId; labelKey: string; icon: any }[] = [
    { id: "overview", labelKey: "studentProfile.overview", icon: User },
    { id: "packages", labelKey: "studentProfile.packages", icon: Package },
    { id: "classes", labelKey: "studentProfile.classes", icon: BookOpen },
    { id: "bills", labelKey: "studentProfile.bills", icon: DollarSign },
    { id: "duties", labelKey: "studentProfile.duties", icon: ClipboardList },
    { id: "reports", labelKey: "studentProfile.reports", icon: FileText },
    { id: "activity", labelKey: "studentProfile.activityTimeline", icon: Activity },
  ];

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    if (studentId) {
      loadProfile();
    }
  }, [studentId]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await StudentService.getStudent(studentId);
      setProfile(data);
    } catch (err: any) {
      setError(err.message || "Failed to load student profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (studentData: any) => {
    await StudentService.updateStudent(studentId, studentData);
    await loadProfile();
    setIsEditOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0]?.toUpperCase() || "")
      .join("")
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 border-green-200";
      case "paused":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "stopped":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className={cn("text-red-600", direction === "rtl" && "text-right")}>
          {error || t("studentProfile.studentNotFound") || "Student not found"}
        </p>
        <Link href="/dashboard/students">
          <Button>
            <ArrowLeft className={cn("h-4 w-4", direction === "rtl" ? "ml-2" : "mr-2")} />
            {t("studentProfile.backToStudents") || "Back to Students"}
          </Button>
        </Link>
      </div>
    );
  }

  const { student, stats, activity_level } = profile;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn("space-y-6", direction === "rtl" && "rtl")}
    >
      {/* Modern Header Section */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50">
          <CardContent className="p-6">
            <div className={cn("flex items-start justify-between", direction === "rtl" && "flex-row-reverse")}>
              <div className={cn("flex items-start gap-6", direction === "rtl" && "flex-row-reverse")}>
                <Link href="/dashboard/students">
                  <Button variant="outline" size="icon" className="h-10 w-10">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <Avatar className="h-20 w-20 ring-4 ring-white shadow-lg">
                  <AvatarFallback className="bg-gradient-primary text-white text-2xl font-bold">
                    {getInitials(student.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className={cn("flex-1 min-w-0", direction === "rtl" && "text-right")}>
                  <div className={cn("flex items-center mb-2", direction === "rtl" ? "flex-row-reverse gap-3" : "gap-3")}>
                    <h1 className={cn("text-3xl font-bold text-gray-900", direction === "rtl" && "text-right")}>
                      {student.full_name}
                    </h1>
                    <Badge
                      className={cn("border flex-shrink-0", getStatusColor(student.status))}
                    >
                      {t(`students.${student.status}`) || student.status}
                    </Badge>
                  </div>
                  <div className={cn(
                    "flex flex-wrap items-center text-sm text-gray-600",
                    direction === "rtl" ? "flex-row-reverse gap-4" : "gap-4"
                  )}>
                    {student.email && (
                      <div className={cn("flex items-center", direction === "rtl" ? "flex-row-reverse gap-2" : "gap-2")}>
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span className={cn(direction === "rtl" && "text-right")}>{student.email}</span>
                      </div>
                    )}
                    {student.whatsapp && (
                      <div className={cn("flex items-center", direction === "rtl" ? "flex-row-reverse gap-2" : "gap-2")}>
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span className={cn(direction === "rtl" && "text-right")}>{student.whatsapp}</span>
                      </div>
                    )}
                    {student.country && (
                      <div className={cn("flex items-center", direction === "rtl" ? "flex-row-reverse gap-2" : "gap-2")}>
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className={cn(direction === "rtl" && "text-right")}>{student.country}</span>
                      </div>
                    )}
                    {student.family && (
                      <div className={cn("flex items-center", direction === "rtl" ? "flex-row-reverse gap-2" : "gap-2")}>
                        <User className="h-4 w-4 flex-shrink-0" />
                        <span className={cn(direction === "rtl" && "text-right")}>
                          {t("studentProfile.family") || "Family"}: {student.family.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className={cn("flex items-center gap-2", direction === "rtl" && "flex-row-reverse")}>
                <Button
                  onClick={() => setIsEditOpen(true)}
                  className="gradient-primary text-white hover:opacity-90 shadow-vuxy"
                >
                  <Edit className={cn("h-4 w-4", direction === "rtl" ? "ml-2" : "mr-2")} />
                  {t("students.edit") || "Edit"}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={direction === "rtl" ? "start" : "end"}>
                    <DropdownMenuItem>
                      <FileText className={cn("h-4 w-4", direction === "rtl" ? "ml-2" : "mr-2")} />
                      {t("studentProfile.exportProfile") || "Export Profile"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className={cn(
              "flex items-center",
              direction === "rtl" ? "flex-row-reverse justify-between" : "justify-between"
            )}>
              <div className={cn("flex-1 min-w-0", direction === "rtl" && "text-right")}>
                <p className={cn("text-sm font-medium text-gray-600 mb-1", direction === "rtl" && "text-right")}>
                  {t("studentProfile.totalPackages") || "Total Packages"}
                </p>
                <p className={cn("text-2xl font-bold text-gray-900", direction === "rtl" && "text-right")}>
                  {stats?.total_packages || 0}
                </p>
              </div>
              <div className={cn(
                "h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0",
                direction === "rtl" ? "ml-3" : "mr-3"
              )}>
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className={cn(
              "flex items-center",
              direction === "rtl" ? "flex-row-reverse justify-between" : "justify-between"
            )}>
              <div className={cn("flex-1 min-w-0", direction === "rtl" && "text-right")}>
                <p className={cn("text-sm font-medium text-gray-600 mb-1", direction === "rtl" && "text-right")}>
                  {t("studentProfile.totalClasses") || "Total Classes"}
                </p>
                <p className={cn("text-2xl font-bold text-gray-900", direction === "rtl" && "text-right")}>
                  {stats?.total_classes || 0}
                </p>
              </div>
              <div className={cn(
                "h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0",
                direction === "rtl" ? "ml-3" : "mr-3"
              )}>
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className={cn(
              "flex items-center",
              direction === "rtl" ? "flex-row-reverse justify-between" : "justify-between"
            )}>
              <div className={cn("flex-1 min-w-0", direction === "rtl" && "text-right")}>
                <p className={cn("text-sm font-medium text-gray-600 mb-1", direction === "rtl" && "text-right")}>
                  {t("studentProfile.totalBills") || "Total Bills"}
                </p>
                <p className={cn("text-2xl font-bold text-gray-900", direction === "rtl" && "text-right")}>
                  {stats?.total_bills || 0}
                </p>
              </div>
              <div className={cn(
                "h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0",
                direction === "rtl" ? "ml-3" : "mr-3"
              )}>
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className={cn(
              "flex items-center",
              direction === "rtl" ? "flex-row-reverse justify-between" : "justify-between"
            )}>
              <div className={cn("flex-1 min-w-0", direction === "rtl" && "text-right")}>
                <p className={cn("text-sm font-medium text-gray-600 mb-1", direction === "rtl" && "text-right")}>
                  {t("studentProfile.pendingBills") || "Pending Bills"}
                </p>
                <p className={cn("text-2xl font-bold text-orange-600", direction === "rtl" && "text-right")}>
                  {stats?.pending_bills || 0}
                </p>
              </div>
              <div className={cn(
                "h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0",
                direction === "rtl" ? "ml-3" : "mr-3"
              )}>
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Modern Tabs */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className={cn("flex overflow-x-auto border-b", direction === "rtl" && "flex-row-reverse")}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center px-6 py-4 border-b-2 transition-all relative",
                      direction === "rtl" ? "space-x-reverse space-x-2" : "space-x-2",
                      isActive
                        ? "border-purple-500 text-purple-600 bg-purple-50/50"
                        : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50/50"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", isActive && "text-purple-600")} />
                    <span className="font-medium whitespace-nowrap">{t(tab.labelKey) || tab.labelKey}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tab Content */}
      <motion.div variants={itemVariants}>
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Personal Information */}
            <Card className="lg:col-span-2 border-0 shadow-sm">
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", direction === "rtl" && "flex-row-reverse")}>
                  <User className="h-5 w-5" />
                  <span className={cn(direction === "rtl" && "text-right")}>
                    {t("studentProfile.personalInfo") || "Personal Information"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={cn("space-y-1", direction === "rtl" && "text-right")}>
                    <label className={cn("text-xs font-semibold text-gray-500 uppercase tracking-wide block", direction === "rtl" && "text-right")}>
                      {t("students.fullName") || "Full Name"}
                    </label>
                    <p className={cn("text-base font-medium text-gray-900", direction === "rtl" && "text-right")}>
                      {student.full_name}
                    </p>
                  </div>
                  <div className={cn("space-y-1", direction === "rtl" && "text-right")}>
                    <label className={cn("text-xs font-semibold text-gray-500 uppercase tracking-wide block", direction === "rtl" && "text-right")}>
                      {t("students.email") || "Email"}
                    </label>
                    <p className={cn("text-base font-medium text-gray-900", direction === "rtl" && "text-right")}>
                      {student.email || "—"}
                    </p>
                  </div>
                  <div className={cn("space-y-1", direction === "rtl" && "text-right")}>
                    <label className={cn("text-xs font-semibold text-gray-500 uppercase tracking-wide block", direction === "rtl" && "text-right")}>
                      {t("students.whatsapp") || "WhatsApp"}
                    </label>
                    <p className={cn("text-base font-medium text-gray-900", direction === "rtl" && "text-right")}>
                      {student.whatsapp || "—"}
                    </p>
                  </div>
                  <div className={cn("space-y-1", direction === "rtl" && "text-right")}>
                    <label className={cn("text-xs font-semibold text-gray-500 uppercase tracking-wide block", direction === "rtl" && "text-right")}>
                      {t("students.country") || "Country"}
                    </label>
                    <p className={cn("text-base font-medium text-gray-900", direction === "rtl" && "text-right")}>
                      {student.country || "—"}
                    </p>
                  </div>
                  <div className={cn("space-y-1", direction === "rtl" && "text-right")}>
                    <label className={cn("text-xs font-semibold text-gray-500 uppercase tracking-wide block", direction === "rtl" && "text-right")}>
                      {t("students.currency") || "Currency"}
                    </label>
                    <p className={cn("text-base font-medium text-gray-900", direction === "rtl" && "text-right")}>
                      {student.currency}
                    </p>
                  </div>
                  <div className={cn("space-y-1", direction === "rtl" && "text-right")}>
                    <label className={cn("text-xs font-semibold text-gray-500 uppercase tracking-wide block", direction === "rtl" && "text-right")}>
                      {t("students.timezone") || "Timezone"}
                    </label>
                    <p className={cn("text-base font-medium text-gray-900", direction === "rtl" && "text-right")}>
                      {getTimezoneByIdentifier(student.timezone)?.displayName || student.timezone}
                    </p>
                  </div>
                  {student.tags && student.tags.length > 0 && (
                    <div className={cn("md:col-span-2 space-y-1", direction === "rtl" && "text-right")}>
                      <label className={cn("text-xs font-semibold text-gray-500 uppercase tracking-wide block", direction === "rtl" && "text-right")}>
                        {t("students.tags") || "Tags"}
                      </label>
                      <div className={cn("flex flex-wrap mt-2", direction === "rtl" ? "gap-2" : "gap-2")}>
                        {student.tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline" className={cn("gap-1", direction === "rtl" && "flex-row-reverse")}>
                            <Tag className="h-3 w-3" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {student.notes && (
                    <div className={cn("md:col-span-2 space-y-1", direction === "rtl" && "text-right")}>
                      <label className={cn("text-xs font-semibold text-gray-500 uppercase tracking-wide block", direction === "rtl" && "text-right")}>
                        {t("students.notes") || "Notes"}
                      </label>
                      <p className={cn("text-base text-gray-700 mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200", direction === "rtl" && "text-right")}>
                        {student.notes}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats & Activity Level */}
            <div className="space-y-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className={cn("text-lg", direction === "rtl" && "text-right")}>
                    {t("studentProfile.quickStats") || "Quick Stats"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className={cn("flex items-center justify-between", direction === "rtl" && "flex-row-reverse")}>
                    <span className={cn("text-sm text-gray-600", direction === "rtl" && "text-right")}>
                      {t("studentProfile.activityLevel") || "Activity Level"}
                    </span>
                    <Badge variant="outline" className="flex-shrink-0">{activity_level}</Badge>
                  </div>
                  <Separator />
                  <div className={cn("flex items-center justify-between", direction === "rtl" && "flex-row-reverse")}>
                    <span className={cn("text-sm text-gray-600", direction === "rtl" && "text-right")}>
                      {t("studentProfile.attendedClasses") || "Attended Classes"}
                    </span>
                    <span className={cn("font-semibold flex-shrink-0", direction === "rtl" && "text-right")}>
                      {stats?.attended_classes || 0}
                    </span>
                  </div>
                  <Separator />
                  <div className={cn("flex items-center justify-between", direction === "rtl" && "flex-row-reverse")}>
                    <span className={cn("text-sm text-gray-600", direction === "rtl" && "text-right")}>
                      {t("studentProfile.paidBills") || "Paid Bills"}
                    </span>
                    <span className={cn("font-semibold text-green-600 flex-shrink-0", direction === "rtl" && "text-right")}>
                      {stats?.paid_bills || 0}
                    </span>
                  </div>
                  <Separator />
                  <div className={cn("flex items-center justify-between", direction === "rtl" && "flex-row-reverse")}>
                    <span className={cn("text-sm text-gray-600", direction === "rtl" && "text-right")}>
                      {t("studentProfile.totalDuties") || "Total Duties"}
                    </span>
                    <span className={cn("font-semibold flex-shrink-0", direction === "rtl" && "text-right")}>
                      {stats?.total_duties || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {student.family && (
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className={cn("text-lg flex items-center gap-2", direction === "rtl" && "flex-row-reverse text-right")}>
                      <User className="h-5 w-5" />
                      <span className={cn(direction === "rtl" && "text-right")}>
                        {t("studentProfile.family") || "Family"}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={cn("space-y-2", direction === "rtl" && "text-right")}>
                      <p className={cn("font-medium text-gray-900", direction === "rtl" && "text-right")}>
                        {student.family.name}
                      </p>
                      {student.family.email && (
                        <p className={cn("text-sm text-gray-600", direction === "rtl" && "text-right")}>
                          {student.family.email}
                        </p>
                      )}
                      {student.family.whatsapp && (
                        <p className={cn("text-sm text-gray-600", direction === "rtl" && "text-right")}>
                          {student.family.whatsapp}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {activeTab === "packages" && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {t("studentProfile.packages") || "Packages & Rounds"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile.packages && profile.packages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.packages.map((pkg: any) => (
                    <Card key={pkg.id} className="border border-gray-200 hover:border-purple-300 transition-colors">
                      <CardContent className="p-5">
                        <div className={cn("flex items-start justify-between mb-3", direction === "rtl" && "flex-row-reverse")}>
                          <div className={cn("flex-1", direction === "rtl" && "text-right")}>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {pkg.name || `${t("studentProfile.package") || "Package"} #${pkg.id}`}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {t("studentProfile.status") || "Status"}: {pkg.status}
                            </p>
                          </div>
                          <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                            {pkg.rounds || 0} {t("studentProfile.rounds") || "rounds"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className={cn("text-gray-500", direction === "rtl" && "text-right")}>
                    {t("studentProfile.noPackages") || "No packages found"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "classes" && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {t("studentProfile.classes") || "Classes History"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile.classes && profile.classes.length > 0 ? (
                <div className="space-y-3">
                  {profile.classes.map((classItem: any) => (
                    <Card key={classItem.id} className="border border-gray-200 hover:border-blue-300 transition-colors">
                      <CardContent className="p-4">
                        <div className={cn("flex items-start justify-between", direction === "rtl" && "flex-row-reverse")}>
                          <div className={cn("flex-1", direction === "rtl" && "text-right")}>
                            <div className="flex items-center gap-3 mb-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="font-medium text-gray-900">
                                {new Date(classItem.class_date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="h-4 w-4" />
                              <span>{classItem.start_time} - {classItem.end_time}</span>
                            </div>
                          </div>
                          <Badge
                            className={cn(
                              classItem.status === "completed" && "bg-green-100 text-green-700 border-green-200",
                              classItem.status === "pending" && "bg-yellow-100 text-yellow-700 border-yellow-200",
                              classItem.status === "cancelled" && "bg-red-100 text-red-700 border-red-200"
                            )}
                          >
                            {classItem.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className={cn("text-gray-500", direction === "rtl" && "text-right")}>
                    {t("studentProfile.noClasses") || "No classes found"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "bills" && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                {t("studentProfile.bills") || "Bills & Payments"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile.bills && profile.bills.length > 0 ? (
                <div className="space-y-3">
                  {profile.bills.map((bill: any) => (
                    <Card key={bill.id} className="border border-gray-200 hover:border-green-300 transition-colors">
                      <CardContent className="p-4">
                        <div className={cn("flex items-start justify-between", direction === "rtl" && "flex-row-reverse")}>
                          <div className={cn("flex-1", direction === "rtl" && "text-right")}>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {t("studentProfile.bill") || "Bill"} #{bill.id}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {t("studentProfile.amount") || "Amount"}: <span className="font-medium">{bill.amount} {student.currency}</span>
                            </p>
                            {bill.due_date && (
                              <p className="text-xs text-gray-500 mt-1">
                                {t("studentProfile.dueDate") || "Due Date"}: {new Date(bill.due_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <Badge
                            className={cn(
                              bill.status === "paid" && "bg-green-100 text-green-700 border-green-200",
                              bill.status === "pending" && "bg-orange-100 text-orange-700 border-orange-200",
                              bill.status === "overdue" && "bg-red-100 text-red-700 border-red-200"
                            )}
                          >
                            {bill.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className={cn("text-gray-500", direction === "rtl" && "text-right")}>
                    {t("studentProfile.noBills") || "No bills found"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "duties" && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                {t("studentProfile.duties") || "Duties"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile.duties && profile.duties.length > 0 ? (
                <div className="space-y-3">
                  {profile.duties.map((duty: any) => (
                    <Card key={duty.id} className="border border-gray-200 hover:border-purple-300 transition-colors">
                      <CardContent className="p-4">
                        <div className={cn("space-y-2", direction === "rtl" && "text-right")}>
                          <h3 className="font-semibold text-gray-900">
                            {duty.title || `${t("studentProfile.duty") || "Duty"} #${duty.id}`}
                          </h3>
                          {duty.description && (
                            <p className="text-sm text-gray-600">{duty.description}</p>
                          )}
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{duty.status}</Badge>
                            {duty.due_date && (
                              <span className="text-xs text-gray-500">
                                {t("studentProfile.dueDate") || "Due"}: {new Date(duty.due_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className={cn("text-gray-500", direction === "rtl" && "text-right")}>
                    {t("studentProfile.noDuties") || "No duties found"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "reports" && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t("studentProfile.reports") || "Reports"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile.reports && profile.reports.length > 0 ? (
                <div className="space-y-3">
                  {profile.reports.map((report: any) => (
                    <Card key={report.id} className="border border-gray-200 hover:border-blue-300 transition-colors">
                      <CardContent className="p-4">
                        <div className={cn("flex items-start justify-between", direction === "rtl" && "flex-row-reverse")}>
                          <div className={cn("flex-1", direction === "rtl" && "text-right")}>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {report.title || `${t("studentProfile.report") || "Report"} #${report.id}`}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {t("studentProfile.created") || "Created"}: {new Date(report.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            {t("studentProfile.view") || "View"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className={cn("text-gray-500", direction === "rtl" && "text-right")}>
                    {t("studentProfile.noReports") || "No reports found"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "activity" && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {t("studentProfile.activityTimeline") || "Activity Timeline"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile.activityLogs && profile.activityLogs.length > 0 ? (
                <div className="space-y-4">
                  {profile.activityLogs.map((log: any, idx: number) => (
                    <div
                      key={idx}
                      className={cn(
                        "relative pl-6 pb-4",
                        direction === "rtl" && "pr-6 pl-0"
                      )}
                    >
                      {idx < profile.activityLogs!.length - 1 && (
                        <div
                          className={cn(
                            "absolute top-6 bottom-0 w-0.5 bg-gray-200",
                            direction === "rtl" ? "right-2" : "left-2"
                          )}
                        />
                      )}
                      <div className={cn("flex items-start gap-3", direction === "rtl" && "flex-row-reverse")}>
                        <div className={cn(
                          "h-4 w-4 rounded-full border-2 border-white shadow-sm z-10",
                          direction === "rtl" ? "ml-2" : "mr-2",
                          log.action?.includes("created") && "bg-green-500",
                          log.action?.includes("updated") && "bg-blue-500",
                          log.action?.includes("deleted") && "bg-red-500",
                          (!log.action || (!log.action.includes("created") && !log.action.includes("updated") && !log.action.includes("deleted"))) && "bg-purple-500"
                        )} />
                        <div className={cn("flex-1", direction === "rtl" && "text-right")}>
                          <p className="font-medium text-gray-900">{log.description || log.action}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(log.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className={cn("text-gray-500", direction === "rtl" && "text-right")}>
                    {t("studentProfile.noActivityLogs") || "No activity logs found"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Edit Modal */}
      <StudentFormModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        student={student}
        onSave={handleSave}
        isLoading={isLoading}
      />
    </motion.div>
  );
}
