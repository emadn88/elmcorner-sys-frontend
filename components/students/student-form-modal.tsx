"use client";

import { useEffect, useState, useRef } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Student } from "@/lib/api/types";
import { FamilyService } from "@/lib/services/family.service";
import { Family } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";
import { COUNTRIES, getTimezoneForCountry, getCurrencyForCountry } from "@/lib/countries-timezones";
import { validateWhatsAppNumber, autoFormatPhoneNumber, ValidationResult } from "@/lib/whatsapp-validator";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, AlertCircle, ExternalLink } from "lucide-react";

interface StudentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: Student | null;
  onSave: (student: Partial<Student>) => Promise<void>;
  isLoading?: boolean;
}

export function StudentFormModal({
  open,
  onOpenChange,
  student,
  onSave,
  isLoading = false,
}: StudentFormModalProps) {
  const { t, direction } = useLanguage();
  const isEdit = !!student;

  // Form state
  const [formData, setFormData] = useState({
    family_id: "",
    full_name: "",
    email: "",
    whatsapp: "",
    country: "",
    currency: "USD",
    timezone: "UTC",
    status: "active" as "active" | "paused" | "stopped",
    type: "trial" as "trial" | "confirmed",
  });

  const [families, setFamilies] = useState<Family[]>([]);
  const [familySearch, setFamilySearch] = useState("");
  const [isFamilySearching, setIsFamilySearching] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [isCountrySearching, setIsCountrySearching] = useState(false);
  const [filteredCountries, setFilteredCountries] = useState<typeof COUNTRIES>([]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [whatsappError, setWhatsappError] = useState<string | null>(null);
  const [whatsappValidation, setWhatsappValidation] = useState<{
    isValid: boolean;
    formatted: string;
    whatsappLink?: string;
  } | null>(null);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  // Load families for autocomplete
  useEffect(() => {
    if (open && isFamilySearching && familySearch && familySearch.length > 0) {
      // Only search if user is actively typing (not just displaying existing value)
      FamilyService.searchFamilies(familySearch)
        .then(setFamilies)
        .catch(() => setFamilies([]));
    } else {
      setFamilies([]);
    }
  }, [familySearch, isFamilySearching, open]);

  // Filter countries based on search
  useEffect(() => {
    if (isCountrySearching && countrySearch) {
      const filtered = COUNTRIES.filter((country) =>
        country.name.toLowerCase().includes(countrySearch.toLowerCase())
      );
      setFilteredCountries(filtered);
    } else {
      setFilteredCountries(COUNTRIES);
    }
  }, [countrySearch, isCountrySearching]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCountryDropdown(false);
      }
    };

    if (showCountryDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCountryDropdown]);

  useEffect(() => {
    if (student) {
      setFormData({
        family_id: student.family_id?.toString() || "",
        full_name: student.full_name,
        email: student.email || "",
        whatsapp: student.whatsapp || "",
        country: student.country || "",
        currency: student.currency || "USD",
        timezone: student.timezone || "UTC",
        status: student.status,
        type: student.type || "trial",
      });
      // Set display values but don't trigger dropdowns
      if (student.family) {
        setFamilySearch(student.family.name);
      } else {
        setFamilySearch("");
      }
      setIsFamilySearching(false);
      // Reset country search state - don't trigger dropdown on load
      setCountrySearch("");
      setIsCountrySearching(false);
    } else {
      setFormData({
        family_id: "",
        full_name: "",
        email: "",
        whatsapp: "",
        country: "",
        currency: "USD",
        timezone: "UTC",
        status: "active",
        type: "trial",
      });
      setFamilySearch("");
      setIsFamilySearching(false);
      setCountrySearch("");
      setIsCountrySearching(false);
    }
    setError(null);
    setWhatsappError(null);
    setWhatsappValidation(null);
    setShowCountryDropdown(false);
    setFamilies([]);
  }, [student, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate WhatsApp if provided - must be valid before submitting
    if (formData.whatsapp) {
      const validation = validateWhatsAppNumber(formData.whatsapp, formData.country);
      if (!validation.isValid) {
        setWhatsappError(validation.message);
        setWhatsappValidation(validation);
        return;
      }
      // Use formatted number
      formData.whatsapp = validation.formatted;
    }
    
    try {
      const submitData: Partial<Student> = {
        full_name: formData.full_name,
        email: formData.email || undefined,
        whatsapp: formData.whatsapp || undefined,
        country: formData.country || undefined,
        currency: formData.currency,
        timezone: formData.timezone,
        status: formData.status,
      };
      if (formData.family_id) {
        submitData.family_id = Number(formData.family_id);
      }
      await onSave(submitData);
    } catch (err: any) {
      setError(err.message || "Failed to save student");
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      
      // Auto-update timezone and currency when country changes
      if (field === "country" && value) {
        const timezone = getTimezoneForCountry(value);
        const currency = getCurrencyForCountry(value);
        updated.timezone = timezone;
        // Only auto-set currency if it's still the default or empty
        if (!prev.currency || prev.currency === "USD") {
          updated.currency = currency;
        }
        
        // Re-validate WhatsApp if country changes
        if (prev.whatsapp) {
          const validation = validateWhatsAppNumber(prev.whatsapp, value);
          setWhatsappValidation(validation);
          setWhatsappError(validation.isValid ? null : validation.message || null);
          if (validation.isValid && validation.formatted !== prev.whatsapp) {
            updated.whatsapp = validation.formatted;
          }
        }
      }
      
      // Validate WhatsApp number when it changes
      if (field === "whatsapp") {
        // Auto-format the number first
        const autoFormatted = autoFormatPhoneNumber(value, prev.country);
        updated.whatsapp = autoFormatted;
        
        // Then validate
        const validation = validateWhatsAppNumber(autoFormatted, prev.country);
        setWhatsappValidation(validation);
        setWhatsappError(validation.isValid ? null : validation.message || null);
      }
      
      return updated;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={cn("text-left rtl:text-right")}>
            {isEdit ? t("students.editStudent") : t("students.addStudent")}
          </DialogTitle>
          <DialogDescription className={cn("text-left rtl:text-right")}>
            {isEdit
              ? t("students.editStudentDescription")
              : t("students.addStudentDescription")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm text-left rtl:text-right">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">{t("students.fullName")}</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleChange("full_name", e.target.value)}
                required
                placeholder={t("students.fullNamePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("students.email")}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder={t("students.emailPlaceholder")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp">{t("students.whatsapp")}</Label>
              <div className="relative">
                <Input
                  id="whatsapp"
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => handleChange("whatsapp", e.target.value)}
                  placeholder={t("students.whatsappPlaceholder") || "+966501234567"}
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
              <Label htmlFor="status">{t("students.status")}</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t("students.active")}</SelectItem>
                  <SelectItem value="paused">{t("students.paused")}</SelectItem>
                  <SelectItem value="stopped">{t("students.stopped")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">{t("students.type.label") || "Type"}</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange("type", value)}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trial">{t("students.type.trial") || "Trial"}</SelectItem>
                  <SelectItem value="confirmed">{t("students.type.confirmed") || "Confirmed"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="family">{t("students.family")}</Label>
              <div className="relative">
                <Input
                  id="family"
                  value={familySearch}
                  onChange={(e) => {
                    const value = e.target.value;
                    setIsFamilySearching(true);
                    setFamilySearch(value);
                    if (!value) {
                      handleChange("family_id", "");
                    }
                  }}
                  onFocus={() => {
                    // Only show dropdown if user starts typing
                    if (familySearch && familySearch !== (student?.family?.name || "")) {
                      setIsFamilySearching(true);
                    }
                  }}
                  onBlur={() => {
                    // Reset search state when user leaves the field
                    setTimeout(() => {
                      if (families.length === 0) {
                        setIsFamilySearching(false);
                      }
                    }, 200);
                  }}
                  placeholder={t("students.familyPlaceholder")}
                />
                {families.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-40 overflow-auto text-left rtl:text-right">
                    {families.map((family) => (
                      <div
                        key={family.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-left rtl:text-right"
                        onClick={() => {
                          handleChange("family_id", family.id.toString());
                          setFamilySearch(family.name);
                          setIsFamilySearching(false);
                          setFamilies([]);
                        }}
                      >
                        {family.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">{t("students.country")}</Label>
              <div className="relative" ref={countryDropdownRef}>
                <Input
                  id="country"
                  value={isCountrySearching ? countrySearch : formData.country}
                  onChange={(e) => {
                    const value = e.target.value;
                    setIsCountrySearching(true);
                    setCountrySearch(value);
                    if (!value) {
                      handleChange("country", "");
                      setShowCountryDropdown(false);
                    } else {
                      setShowCountryDropdown(true);
                    }
                  }}
                  onFocus={() => {
                    // Show dropdown when user focuses on the input
                    setShowCountryDropdown(true);
                    if (!isCountrySearching) {
                      setCountrySearch(formData.country || "");
                      setIsCountrySearching(true);
                    }
                  }}
                  onBlur={() => {
                    // Reset search state when user leaves the field
                    // Delay to allow dropdown click to register
                    setTimeout(() => {
                      if (!showCountryDropdown) {
                        setIsCountrySearching(false);
                        setCountrySearch("");
                      }
                    }, 200);
                  }}
                  placeholder={t("students.countryPlaceholder") || "Search or select country"}
                />
                {showCountryDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto text-left rtl:text-right">
                    {(countrySearch ? filteredCountries : COUNTRIES).map((country) => (
                      <div
                        key={country.code}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-left rtl:text-right"
                        onClick={() => {
                          handleChange("country", country.name);
                          setCountrySearch("");
                          setIsCountrySearching(false);
                          setShowCountryDropdown(false);
                        }}
                      >
                        {country.name}
                      </div>
                    ))}
                    {countrySearch && filteredCountries.length === 0 && (
                      <div className="px-4 py-2 text-sm text-gray-500 text-left rtl:text-right">
                        {t("students.noCountryFound") || "No country found"}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">{t("students.currency")}</Label>
              <Input
                id="currency"
                value={formData.currency}
                onChange={(e) => handleChange("currency", e.target.value.toUpperCase())}
                placeholder="USD"
                maxLength={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">{t("students.timezone")}</Label>
              <Input
                id="timezone"
                value={formData.timezone}
                placeholder="UTC"
                readOnly
                className="bg-gray-50"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t("students.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? t("students.saving")
                : isEdit
                ? t("students.update")
                : t("students.add")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}



