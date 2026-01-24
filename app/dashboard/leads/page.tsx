"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadsFilters } from "@/components/leads/leads-filters";
import { LeadsTable } from "@/components/leads/leads-table";
import { LeadFormModal } from "@/components/leads/lead-form-modal";
import { ConvertLeadModal } from "@/components/leads/convert-lead-modal";
import { DeleteConfirmationModal } from "@/components/students/delete-confirmation-modal";
import { TrialFormModal } from "@/components/trials/trial-form-modal";
import { TrialService } from "@/lib/services/trial.service";
import { Lead, LeadFilters, LeadStats } from "@/lib/api/types";
import { LeadService } from "@/lib/services/lead.service";
import { useLanguage } from "@/contexts/language-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { StatCard } from "@/components/dashboard/stat-card";
import { Users, Clock, Calendar, TrendingUp, CheckCircle } from "lucide-react";

export default function LeadsPage() {
  const { t, direction } = useLanguage();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filters, setFilters] = useState<LeadFilters>({
    status: "all",
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isTrialOpen, setIsTrialOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);
  const [trialLead, setTrialLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [stats, setStats] = useState<LeadStats>({
    total: 0,
    new: 0,
    needs_follow_up: 0,
    trials_scheduled: 0,
    converted: 0,
    conversion_rate: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Fetch leads
  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await LeadService.getLeads({
        ...filters,
        page: currentPage,
        per_page: 15,
      });
      setLeads(response.data);
      setTotalPages(response.last_page);
    } catch (err: any) {
      setError(err.message || t("leads.errorLoading") || "Failed to fetch leads");
      console.error("Error fetching leads:", err);
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const statsData = await LeadService.getLeadStats();
      setStats(statsData);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, [filters, currentPage]);

  const handleCreate = () => {
    setEditingLead(null);
    setIsFormOpen(true);
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setIsFormOpen(true);
  };

  const handleConvert = (lead: Lead) => {
    setConvertingLead(lead);
    setIsConvertOpen(true);
  };

  const handleDelete = (lead: Lead) => {
    setDeletingLead(lead);
    setIsDeleteOpen(true);
  };

  const handleSave = async (leadData: Partial<Lead>) => {
    try {
      if (editingLead) {
        await LeadService.updateLead(editingLead.id, leadData);
      } else {
        await LeadService.createLead(leadData);
      }
      await fetchLeads();
      await fetchStats();
      setIsFormOpen(false);
      setEditingLead(null);
    } catch (err: any) {
      throw err;
    }
  };

  const handleConvertSubmit = async (data: any) => {
    if (!convertingLead) return;
    try {
      await LeadService.convertLead(convertingLead.id, data);
      await fetchLeads();
      await fetchStats();
      setIsConvertOpen(false);
      setConvertingLead(null);
    } catch (err: any) {
      throw err;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingLead) return;
    try {
      await LeadService.deleteLead(deletingLead.id);
      await fetchLeads();
      await fetchStats();
      setIsDeleteOpen(false);
      setDeletingLead(null);
    } catch (err: any) {
      console.error("Error deleting lead:", err);
    }
  };

  const handleAddTrial = (lead: Lead) => {
    setTrialLead(lead);
    setIsTrialOpen(true);
  };

  const handleTrialSave = async (trialData: any) => {
    if (!trialLead) return;
    try {
      // Create a new student first if needed, or use existing
      const studentData = {
        full_name: trialLead.name,
        whatsapp: trialLead.whatsapp,
        country: trialLead.country,
        currency: "USD",
        timezone: trialLead.timezone || "UTC",
      };

      // Create trial with new student
      await TrialService.createTrial({
        ...trialData,
        new_student: studentData,
      });

      // Update lead status to trial_scheduled
      await LeadService.updateLeadStatus(trialLead.id, "trial_scheduled");

      await fetchLeads();
      await fetchStats();
      setIsTrialOpen(false);
      setTrialLead(null);
    } catch (err: any) {
      throw err;
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-6 ${direction === "rtl" ? "text-right" : "text-left"}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("leads.pageTitle") || "Leads"}
          </h1>
          <p className="text-gray-600 mt-2">
            {t("leads.pageDescription") || "Manage Facebook ad inquiries and track conversions"}
          </p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t("leads.create") || "Add Lead"}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t("leads.stats.total") || "Total"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t("leads.stats.new") || "New (This Week)"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t("leads.stats.needsFollowUp") || "Needs Follow-up"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.needs_follow_up}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t("leads.stats.trialsScheduled") || "Trials Scheduled"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.trials_scheduled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t("leads.stats.conversionRate") || "Conversion Rate"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.conversion_rate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t("leads.filters.title") || "Filters"}</CardTitle>
        </CardHeader>
        <CardContent>
          <LeadsFilters filters={filters} onFiltersChange={setFilters} />
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("leads.list") || "Leads"}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              <LeadsTable
                leads={leads}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onConvert={handleConvert}
                onAddTrial={handleAddTrial}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className={`flex items-center justify-between mt-4 ${direction === "rtl" ? "flex-row-reverse" : ""}`}>
                  <div className="text-sm text-gray-600">
                    {t("common.page") || "Page"} {currentPage} {t("common.of") || "of"} {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      {t("common.previous") || "Previous"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      {t("common.next") || "Next"}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <LeadFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        lead={editingLead}
        onSave={handleSave}
      />

      {convertingLead && (
        <ConvertLeadModal
          open={isConvertOpen}
          onOpenChange={setIsConvertOpen}
          lead={convertingLead}
          onConvert={handleConvertSubmit}
        />
      )}

      {deletingLead && (
        <DeleteConfirmationModal
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          onConfirm={handleDeleteConfirm}
          studentName={deletingLead.name || `Lead #${deletingLead.id}`}
          isLoading={isLoading}
        />
      )}

      {trialLead && (
        <TrialFormModal
          open={isTrialOpen}
          onOpenChange={setIsTrialOpen}
          trial={null}
          onSave={handleTrialSave}
        />
      )}
    </div>
  );
}
