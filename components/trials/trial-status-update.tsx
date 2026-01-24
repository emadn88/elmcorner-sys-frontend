"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TrialClass } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";

interface TrialStatusUpdateProps {
  trial: TrialClass;
  onUpdate: (status: TrialClass['status'], notes?: string) => Promise<void>;
  isLoading?: boolean;
}

export function TrialStatusUpdate({
  trial,
  onUpdate,
  isLoading = false,
}: TrialStatusUpdateProps) {
  const { t, direction } = useLanguage();
  const [status, setStatus] = useState<TrialClass['status']>(trial.status);
  const [notes, setNotes] = useState(trial.notes || "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    try {
      await onUpdate(status, notes);
    } catch (err: any) {
      setError(err.message || t("trials.error.updateStatus") || "Failed to update status");
    }
  };

  const canUpdate = trial.status !== 'converted';

  if (!canUpdate) {
    return (
      <div className="text-sm text-gray-500">
        {t("trials.status.cannotUpdate") || "Converted trials cannot have their status changed"}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${direction === "rtl" ? "text-right" : "text-left"}`}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="status">{t("trials.status.label") || "Status"} *</Label>
        <Select
          value={status}
          onValueChange={(value) => setStatus(value as TrialClass['status'])}
        >
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">{t("trials.status.pending") || "Pending"}</SelectItem>
            <SelectItem value="completed">{t("trials.status.completed") || "Completed"}</SelectItem>
            <SelectItem value="no_show">{t("trials.status.noShow") || "No Show"}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">{t("trials.notes") || "Notes"}</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder={t("trials.notesPlaceholder") || "Optional notes"}
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isLoading || status === trial.status}
        className="w-full"
      >
        {isLoading
          ? t("common.updating") || "Updating..."
          : t("common.update") || "Update Status"}
      </Button>
    </div>
  );
}
