"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  FileText,
  Search,
  Filter,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/language-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { TeacherService } from "@/lib/services/teacher.service";
import { TrialClass } from "@/lib/api/types";
import { format } from "date-fns";

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

export default function TeacherTrialsPage() {
  const { t } = useLanguage();
  const [trials, setTrials] = useState<TrialClass[]>([]);
  const [stats, setStats] = useState({
    total_trials: 0,
    pending_trials: 0,
    pending_review_trials: 0,
    completed_trials: 0,
    no_show_trials: 0,
    converted_trials: 0,
    successful_trials: 0,
    unsuccessful_trials: 0,
    conversion_rate: 0,
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTrial, setSelectedTrial] = useState<TrialClass | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trialNotes, setTrialNotes] = useState("");

  useEffect(() => {
    fetchTrials();
  }, [statusFilter, dateFrom, dateTo, search]);

  const fetchTrials = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await TeacherService.getTrials({
        status: statusFilter !== "all" ? statusFilter : undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        search: search || undefined,
      });
      setTrials(response.trials);
      setStats(response.stats);
    } catch (err: any) {
      setError(err.message || "Failed to load trials");
      console.error("Error fetching trials:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (trial: TrialClass) => {
    setSelectedTrial(trial);
    setTrialNotes(trial.notes || "");
    setIsModalOpen(true);
  };

  const handleSubmitForReview = async () => {
    if (!selectedTrial) return;

    if (!trialNotes.trim()) {
      setError(t("teacher.trialNotesRequired") || "Trial report/notes are required");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await TeacherService.submitTrialForReview(selectedTrial.id, trialNotes);
      setIsModalOpen(false);
      setTrialNotes("");
      await fetchTrials();
    } catch (err: any) {
      setError(err.message || "Failed to submit trial for review");
      console.error("Error submitting trial:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "converted":
        return "bg-green-100 text-green-800";
      case "no_show":
        return "bg-red-100 text-red-800";
      case "pending_review":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  const hasFilters = statusFilter !== "all" || dateFrom || dateTo || search;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-gray-900">
          {t("teacher.trials") || "Trial Classes"}
        </h1>
        <p className="text-gray-600 mt-1">
          {t("teacher.viewTrials") || "View and manage your assigned trial classes"}
        </p>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("teacher.totalTrials") || "Total Trials"}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_trials}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("teacher.successfulTrials") || "Successful"}
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.successful_trials}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completed_trials} {t("teacher.completed") || "completed"} + {stats.converted_trials}{" "}
              {t("teacher.converted") || "converted"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("teacher.unsuccessfulTrials") || "Unsuccessful"}
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.unsuccessful_trials}</div>
            <p className="text-xs text-muted-foreground">
              {t("teacher.noShow") || "No show"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("teacher.conversionRate") || "Conversion Rate"}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.conversion_rate}%</div>
            <p className="text-xs text-muted-foreground">
              {t("teacher.completedToConverted") || "Completed to converted"}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                {t("common.search") || "Search"}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                {t("common.filters") || "Filters"}
                {hasFilters && (
                  <span className="ml-1 h-2 w-2 rounded-full bg-primary"></span>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder={t("teacher.searchTrialsPlaceholder") || "Search by student name..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>{t("classes.statusLabel") || "Status"}</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t("classes.allStatuses") || "All Statuses"}
                      </SelectItem>
                      <SelectItem value="pending">
                        {t("trials.status.pending") || "Pending"}
                      </SelectItem>
                      <SelectItem value="pending_review">
                        {t("trials.status.pendingReview") || "Pending Review"}
                      </SelectItem>
                      <SelectItem value="completed">
                        {t("trials.status.completed") || "Completed"}
                      </SelectItem>
                      <SelectItem value="no_show">
                        {t("trials.status.noShow") || "No Show"}
                      </SelectItem>
                      <SelectItem value="converted">
                        {t("trials.status.converted") || "Converted"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("teacher.dateFrom") || "Date From"}</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("teacher.dateTo") || "Date To"}</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>
            )}

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="flex items-center gap-2"
              >
                <X className="h-3 w-3" />
                {t("common.clear") || "Clear Filters"}
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {error && (
        <motion.div
          variants={itemVariants}
          className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg"
        >
          <p className="font-medium">{error}</p>
        </motion.div>
      )}

      {/* Trials List */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trials.map((trial) => (
            <Card key={trial.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {trial.student?.full_name || "Unknown Student"}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {trial.course?.name || "Unknown Course"}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      trial.status
                    )}`}
                  >
                    {trial.status === "completed"
                      ? t("trials.status.completed") || "Completed"
                      : trial.status === "no_show"
                      ? t("trials.status.noShow") || "No Show"
                      : trial.status === "converted"
                      ? t("trials.status.converted") || "Converted"
                      : trial.status === "pending_review"
                      ? t("trials.status.pendingReview") || "Pending Review"
                      : t("trials.status.pending") || "Pending"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>
                      {format(new Date(trial.trial_date), "MMM dd, yyyy")} • {trial.start_time} - {trial.end_time}
                    </span>
                  </div>
                  {trial.notes && (
                    <div className="flex items-start gap-2 pt-1">
                      <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                      <p className="text-xs text-gray-600 line-clamp-2">{trial.notes}</p>
                    </div>
                  )}
                </div>
                {trial.status === "pending" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleOpenModal(trial)}
                  >
                    {t("teacher.submitForReview") || "Submit for Review"}
                  </Button>
                )}
                {trial.status === "pending_review" && (
                  <div className="text-xs text-blue-600 font-medium">
                    {t("teacher.awaitingAdminReview") || "Awaiting admin review"}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {trials.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">
                {t("teacher.noTrialsFound") || "No trials found"}
              </p>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Submit Trial Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {t("teacher.submitTrialForReview") || "Submit Trial for Review"}
            </DialogTitle>
            <DialogDescription>
              {t("teacher.submitTrialDescription") ||
                "Fill in the trial result and submit for admin review. The admin will mark it as successful or unsuccessful."}
            </DialogDescription>
          </DialogHeader>
          {selectedTrial && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedTrial.student?.full_name}</p>
                <p className="text-sm text-gray-600">{selectedTrial.course?.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {format(new Date(selectedTrial.trial_date), "MMM dd, yyyy")} • {selectedTrial.start_time} - {selectedTrial.end_time}
                </p>
              </div>

              <div className="space-y-2">
                <Label>
                  {t("teacher.trialReport") || "Trial Report / Notes"} *
                </Label>
                <Textarea
                  value={trialNotes}
                  onChange={(e) => setTrialNotes(e.target.value)}
                  rows={6}
                  placeholder={t("teacher.trialReportPlaceholder") || "Enter your trial report, observations, student performance, and any notes..."}
                  required
                />
                <p className="text-xs text-gray-500">
                  {t("teacher.trialReportHint") || "Please provide detailed information about the trial class for admin review."}
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  {t("common.cancel") || "Cancel"}
                </Button>
                <Button onClick={handleSubmitForReview} disabled={isSubmitting || !trialNotes.trim()}>
                  {isSubmitting
                    ? t("common.submitting") || "Submitting..."
                    : t("teacher.submitForReview") || "Submit for Review"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
