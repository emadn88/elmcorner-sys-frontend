"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TeacherService } from "@/lib/services/teacher.service";
import { TeacherClass, EvaluationOption } from "@/lib/api/types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface ClassDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classItem: TeacherClass;
  onUpdate: () => void;
}

export function ClassDetailsModal({
  open,
  onOpenChange,
  classItem,
  onUpdate,
}: ClassDetailsModalProps) {
  const [status, setStatus] = useState(classItem.status);
  const [studentEvaluation, setStudentEvaluation] = useState(
    classItem.student_evaluation || ""
  );
  const [classReport, setClassReport] = useState(classItem.class_report || "");
  const [notes, setNotes] = useState(classItem.notes || "");
  const [evaluationOptions, setEvaluationOptions] = useState<EvaluationOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      fetchEvaluationOptions();
    }
  }, [open]);

  const fetchEvaluationOptions = async () => {
    try {
      setIsLoading(true);
      const options = await TeacherService.getEvaluationOptions();
      setEvaluationOptions(options);
    } catch (error) {
      console.error("Failed to fetch evaluation options:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await TeacherService.updateClassDetails(classItem.id, {
        student_evaluation: studentEvaluation,
        class_report: classReport,
        notes: notes,
      });
      if (status !== classItem.status) {
        await TeacherService.updateClassStatus(classItem.id, status as any);
      }
      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      alert(error.message || "Failed to update class");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = async () => {
    const reason = prompt("Please provide a reason for cancellation:");
    if (reason) {
      try {
        setIsSaving(true);
        await TeacherService.cancelClass(classItem.id, reason);
        onUpdate();
        onOpenChange(false);
      } catch (error: any) {
        alert(error.message || "Failed to cancel class");
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Class Details</DialogTitle>
          <DialogDescription>
            Update class status, evaluation, and notes
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-6">
            {/* Status */}
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="attended">Attended</SelectItem>
                  <SelectItem value="absent_student">Absent Student</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Student Evaluation */}
            <div>
              <Label>Student Evaluation</Label>
              <Select
                value={studentEvaluation}
                onValueChange={setStudentEvaluation}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select evaluation" />
                </SelectTrigger>
                <SelectContent>
                  {evaluationOptions.map((option) => (
                    <SelectItem key={option.id} value={option.option_text}>
                      {option.option_text}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                value={studentEvaluation}
                onChange={(e) => setStudentEvaluation(e.target.value)}
                placeholder="Additional evaluation notes..."
                className="mt-2"
                rows={3}
              />
            </div>

            {/* Class Report */}
            <div>
              <Label>Class Report</Label>
              <Textarea
                value={classReport}
                onChange={(e) => setClassReport(e.target.value)}
                placeholder="Enter class report..."
                rows={5}
              />
            </div>

            {/* Notes */}
            <div>
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-between gap-4">
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={isSaving || classItem.status === "cancelled_by_teacher"}
              >
                Cancel Class
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
