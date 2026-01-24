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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lead } from "@/lib/api/types";
import { useLanguage } from "@/contexts/language-context";
import { COUNTRIES, getTimezoneForCountry } from "@/lib/countries-timezones";
import { cn } from "@/lib/utils";

interface LeadFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: Lead | null;
  onSave: (lead: Partial<Lead>) => Promise<void>;
}

export function LeadFormModal({
  open,
  onOpenChange,
  lead,
  onSave,
}: LeadFormModalProps) {
  const { t, direction } = useLanguage();
  const isEdit = !!lead;

  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    country: "",
    timezone: "",
    number_of_students: 1,
    ages: [] as number[],
    source: "",
    status: "new" as Lead["status"],
    priority: "medium" as Lead["priority"],
    assigned_to: "",
    next_follow_up: "",
    notes: "",
  });

  const [ageInput, setAgeInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [countrySearch, setCountrySearch] = useState("");
  const [isCountrySearching, setIsCountrySearching] = useState(false);
  const [filteredCountries, setFilteredCountries] = useState<typeof COUNTRIES>([]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

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
    if (lead) {
      setFormData({
        name: lead.name || "",
        whatsapp: lead.whatsapp || "",
        country: lead.country || "",
        timezone: lead.timezone || "",
        number_of_students: lead.number_of_students || 1,
        ages: lead.ages || [],
        source: lead.source || "",
        status: lead.status || "new",
        priority: lead.priority || "medium",
        assigned_to: lead.assigned_to?.toString() || "",
        next_follow_up: lead.next_follow_up ? new Date(lead.next_follow_up).toISOString().slice(0, 16) : "",
        notes: lead.notes || "",
      });
      setAgeInput((lead.ages || []).join(", "));
      setCountrySearch("");
      setIsCountrySearching(false);
    } else {
      setFormData({
        name: "",
        whatsapp: "",
        country: "",
        timezone: "",
        number_of_students: 1,
        ages: [],
        source: "",
        status: "new",
        priority: "medium",
        assigned_to: "",
        next_follow_up: "",
        notes: "",
      });
      setAgeInput("");
      setCountrySearch("");
      setIsCountrySearching(false);
    }
    setError(null);
  }, [lead, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Parse ages
      const ages = ageInput
        ? ageInput.split(",").map((a) => parseInt(a.trim())).filter((a) => !isNaN(a))
        : [];

      const leadData: Partial<Lead> = {
        name: formData.name,
        whatsapp: formData.whatsapp,
        country: formData.country || undefined,
        timezone: formData.timezone || undefined,
        number_of_students: formData.number_of_students,
        ages: ages.length > 0 ? ages : undefined,
        source: formData.source || undefined,
        status: formData.status,
        priority: formData.priority,
        assigned_to: formData.assigned_to ? parseInt(formData.assigned_to) : undefined,
        next_follow_up: formData.next_follow_up ? new Date(formData.next_follow_up).toISOString() : undefined,
        notes: formData.notes || undefined,
      };

      await onSave(leadData);
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Failed to save lead");
    }
  };

  const handleCountryChange = (countryCode: string) => {
    setFormData({
      ...formData,
      country: countryCode,
      timezone: countryCode ? getTimezoneForCountry(countryCode) : "",
    });
    if (!countryCode) {
      setCountrySearch("");
      setIsCountrySearching(false);
      setShowCountryDropdown(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("leads.editLead") || "Edit Lead" : t("leads.createLead") || "Add New Lead"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t("leads.editLeadDescription") || "Update lead information"
              : t("leads.createLeadDescription") || "Add a new lead from Facebook ad inquiry"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("leads.name") || "Name"} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">{t("leads.whatsapp") || "WhatsApp"} *</Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                required
                dir="ltr"
                className="text-left"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">{t("leads.country") || "Country"}</Label>
              <div className="relative" ref={countryDropdownRef}>
                <Input
                  id="country"
                  value={isCountrySearching ? countrySearch : (formData.country ? COUNTRIES.find(c => c.code === formData.country)?.name || formData.country : "")}
                  onChange={(e) => {
                    const value = e.target.value;
                    setIsCountrySearching(true);
                    setCountrySearch(value);
                    if (!value) {
                      handleCountryChange("");
                      setShowCountryDropdown(false);
                    } else {
                      setShowCountryDropdown(true);
                    }
                  }}
                  onFocus={() => {
                    setShowCountryDropdown(true);
                    if (!isCountrySearching) {
                      setCountrySearch(formData.country ? COUNTRIES.find(c => c.code === formData.country)?.name || "" : "");
                      setIsCountrySearching(true);
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      if (!showCountryDropdown) {
                        setIsCountrySearching(false);
                        setCountrySearch("");
                      }
                    }, 200);
                  }}
                  placeholder={t("leads.selectCountry") || "Search or select country"}
                />
                {showCountryDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto text-left rtl:text-right">
                    {(countrySearch ? filteredCountries : COUNTRIES).map((country) => (
                      <div
                        key={country.code}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-left rtl:text-right"
                        onClick={() => {
                          handleCountryChange(country.code);
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
                        {t("leads.noCountryFound") || "No country found"}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">{t("leads.timezone") || "Timezone"}</Label>
              <Input
                id="timezone"
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                placeholder="Auto-set from country"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number_of_students">{t("leads.numberOfStudents") || "Number of Students"} *</Label>
              <Input
                id="number_of_students"
                type="number"
                min="1"
                value={formData.number_of_students}
                onChange={(e) => setFormData({ ...formData, number_of_students: parseInt(e.target.value) || 1 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ages">{t("leads.ages") || "Ages (comma-separated)"}</Label>
              <Input
                id="ages"
                value={ageInput}
                onChange={(e) => setAgeInput(e.target.value)}
                placeholder="e.g., 8, 12, 15"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source">{t("leads.source") || "Source/Campaign"}</Label>
              <Input
                id="source"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="e.g., FB Jan 2026"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">{t("leads.statusLabel") || "Status"}</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as Lead["status"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">{t("leads.status.new") || "New"}</SelectItem>
                  <SelectItem value="contacted">{t("leads.status.contacted") || "Contacted"}</SelectItem>
                  <SelectItem value="needs_follow_up">{t("leads.status.needs_follow_up") || "Needs Follow-up"}</SelectItem>
                  <SelectItem value="trial_scheduled">{t("leads.status.trial_scheduled") || "Trial Scheduled"}</SelectItem>
                  <SelectItem value="trial_confirmed">{t("leads.status.trial_confirmed") || "Trial Confirmed"}</SelectItem>
                  <SelectItem value="converted">{t("leads.status.converted") || "Converted"}</SelectItem>
                  <SelectItem value="not_interested">{t("leads.status.not_interested") || "Not Interested"}</SelectItem>
                  <SelectItem value="cancelled">{t("leads.status.cancelled") || "Cancelled"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">{t("leads.priorityLabel") || "Priority"}</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value as Lead["priority"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">{t("leads.priority.high") || "High"}</SelectItem>
                  <SelectItem value="medium">{t("leads.priority.medium") || "Medium"}</SelectItem>
                  <SelectItem value="low">{t("leads.priority.low") || "Low"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="next_follow_up">{t("leads.nextFollowUp") || "Next Follow-up"}</Label>
              <Input
                id="next_follow_up"
                type="datetime-local"
                value={formData.next_follow_up}
                onChange={(e) => setFormData({ ...formData, next_follow_up: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t("leads.notes") || "Notes"}</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              placeholder={t("leads.notesPlaceholder") || "Add any additional notes..."}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button type="submit">
              {isEdit ? t("common.save") || "Save" : t("common.create") || "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
