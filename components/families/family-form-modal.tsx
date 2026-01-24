"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Family } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";
import { validateWhatsAppNumber } from "@/lib/whatsapp-validator";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface FamilyFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  family?: Family | null;
  onSave: (family: Partial<Family>) => Promise<void>;
  isLoading?: boolean;
}

export function FamilyFormModal({
  open,
  onOpenChange,
  family,
  onSave,
  isLoading = false,
}: FamilyFormModalProps) {
  const { t, direction } = useLanguage();
  const isEdit = !!family;

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    country: "",
    currency: "USD",
    timezone: "UTC",
    status: "active" as "active" | "inactive",
    notes: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [whatsappError, setWhatsappError] = useState<string | null>(null);
  const [whatsappValidation, setWhatsappValidation] = useState<{
    isValid: boolean;
    formatted: string;
    whatsappLink?: string;
  } | null>(null);

  useEffect(() => {
    if (family) {
      setFormData({
        name: family.name,
        email: family.email || "",
        whatsapp: family.whatsapp || "",
        country: family.country || "",
        currency: family.currency || "USD",
        timezone: family.timezone || "UTC",
        status: family.status,
        notes: family.notes || "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        whatsapp: "",
        country: "",
        currency: "USD",
        timezone: "UTC",
        status: "active",
        notes: "",
      });
    }
    setError(null);
    setWhatsappError(null);
    setWhatsappValidation(null);
  }, [family, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate WhatsApp if provided
    if (formData.whatsapp) {
      const validation = validateWhatsAppNumber(formData.whatsapp, formData.country);
      if (!validation.isValid) {
        setWhatsappError(validation.error || "Invalid WhatsApp number");
        setWhatsappValidation(validation);
        return;
      }
      // Use formatted number
      formData.whatsapp = validation.formatted;
    }
    
    try {
      const submitData: Partial<Family> = {
        name: formData.name,
        email: formData.email || undefined,
        whatsapp: formData.whatsapp || undefined,
        country: formData.country || undefined,
        currency: formData.currency,
        timezone: formData.timezone,
        status: formData.status,
        notes: formData.notes || undefined,
      };
      await onSave(submitData);
    } catch (err: any) {
      setError(err.message || "Failed to save family");
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      
      // Validate WhatsApp number when it changes
      if (field === "whatsapp") {
        const validation = validateWhatsAppNumber(value, prev.country);
        setWhatsappValidation(validation);
        setWhatsappError(validation.isValid ? null : validation.error || null);
        
        // Auto-format if valid
        if (validation.isValid && validation.formatted !== value) {
          updated.whatsapp = validation.formatted;
        }
      }
      
      // Re-validate WhatsApp if country changes
      if (field === "country" && prev.whatsapp) {
        const validation = validateWhatsAppNumber(prev.whatsapp, value);
        setWhatsappValidation(validation);
        setWhatsappError(validation.isValid ? null : validation.error || null);
        if (validation.isValid && validation.formatted !== prev.whatsapp) {
          updated.whatsapp = validation.formatted;
        }
      }
      
      return updated;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("families.editFamily") || "Edit Family" : t("families.addFamily") || "Add Family"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t("families.editFamilyDescription") || "Update family information"
              : t("families.addFamilyDescription") || "Add a new family to the system"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("families.name") || "Name"}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
                placeholder={t("families.namePlaceholder") || "Enter family name"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("families.email") || "Email"}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder={t("families.emailPlaceholder") || "Enter email address"}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp">{t("families.whatsapp") || "WhatsApp"}</Label>
              <div className="relative">
                <Input
                  id="whatsapp"
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => handleChange("whatsapp", e.target.value)}
                  placeholder={t("families.whatsappPlaceholder") || "+966501234567"}
                  className={cn(
                    whatsappValidation && !whatsappValidation.isValid && "border-red-300 focus:border-red-500 focus:ring-red-500",
                    whatsappValidation && whatsappValidation.isValid && "border-green-300 focus:border-green-500 focus:ring-green-500",
                    formData.whatsapp && whatsappValidation && (direction === "rtl" ? "pl-10" : "pr-10")
                  )}
                />
                {formData.whatsapp && whatsappValidation && (
                  <div className={cn(
                    "absolute top-1/2 -translate-y-1/2 pointer-events-none",
                    direction === "rtl" ? "left-3" : "right-3"
                  )}>
                    {whatsappValidation.isValid ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {whatsappError && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {whatsappError}
                </p>
              )}
              {whatsappValidation?.isValid && whatsappValidation.whatsappLink && (
                <div className="flex items-center gap-2 text-xs text-green-600">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{t("students.whatsappValid") || "Valid WhatsApp number"}</span>
                  <a
                    href={whatsappValidation.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-green-700"
                  >
                    {t("students.testWhatsapp") || "Test link"}
                  </a>
                </div>
              )}
              {formData.country && !formData.whatsapp && (
                <p className="text-xs text-gray-500">
                  {t("students.whatsappHint") || "Format: +[country code][number] (e.g., +966501234567)"}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">{t("families.status") || "Status"}</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t("families.active") || "Active"}</SelectItem>
                  <SelectItem value="inactive">{t("families.inactive") || "Inactive"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">{t("families.country") || "Country"}</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleChange("country", e.target.value)}
                placeholder={t("families.countryPlaceholder") || "Enter country"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">{t("families.currency") || "Currency"}</Label>
              <Input
                id="currency"
                value={formData.currency}
                onChange={(e) => handleChange("currency", e.target.value.toUpperCase())}
                placeholder="USD"
                maxLength={3}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">{t("families.timezone") || "Timezone"}</Label>
            <Input
              id="timezone"
              value={formData.timezone}
              onChange={(e) => handleChange("timezone", e.target.value)}
              placeholder="UTC"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t("families.notes") || "Notes"}</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder={t("families.notesPlaceholder") || "Add any additional notes..."}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t("families.cancel") || "Cancel"}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? t("families.saving") || "Saving..."
                : isEdit
                ? t("families.update") || "Update"
                : t("families.add") || "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
