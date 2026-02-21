"use client";

import { useState } from "react";
import { COMING_FROM_OPTIONS, getStatusLabelTKey, KANBAN_STATUSES } from "./kanban-constants";
import { Lead } from "@/lib/api/types";
import { LeadService } from "@/lib/services/lead.service";
import { useLanguage } from "@/contexts/language-context";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddLeadModalProps {
    onClose: () => void;
    onCreated: (lead: Lead) => void;
    users: { id: number; name: string }[];
}

const inputFieldClass = "w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors";

export function AddLeadModal({ onClose, onCreated, users }: AddLeadModalProps) {
    const { t, direction } = useLanguage();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({
        name: "",
        whatsapp: "",
        coming_from: "",
        coming_from_other: "",
        description: "",
        status: "just_sent_us",
        priority: "medium",
        assigned_to: "",
        follow_up_date: "",
        tags: [] as string[],
    });
    const [tagInput, setTagInput] = useState("");

    function update(field: string, value: string) {
        setForm(f => ({ ...f, [field]: value }));
        setError(null);
    }

    function addTag() {
        const t = tagInput.trim();
        if (t && !form.tags.includes(t)) {
            setForm(f => ({ ...f, tags: [...f.tags, t] }));
        }
        setTagInput("");
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.name.trim() || !form.whatsapp.trim()) {
            setError(t("pipeline.nameWhatsAppRequired"));
            return;
        }
        if (!form.coming_from.trim()) {
            setError(t("pipeline.comingFromRequired"));
            return;
        }
        if (!form.description.trim()) {
            setError(t("pipeline.descriptionRequired"));
            return;
        }

        setSaving(true);
        setError(null);
        try {
            const payload: Record<string, unknown> = {
                ...form,
                assigned_to: form.assigned_to ? Number(form.assigned_to) : undefined,
                follow_up_date: form.follow_up_date || undefined,
                coming_from_other: form.coming_from === "Other" ? form.coming_from_other : undefined,
            };

            const lead = await LeadService.createLead(payload as Parameters<typeof LeadService.createLead>[0]);
            onCreated(lead);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : t("pipeline.failedToCreate"));
        } finally {
            setSaving(false);
        }
    }

    const isRtl = direction === "rtl";

    return (
        <>
            <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col">
                    <div className={cn("flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700", isRtl ? "flex-row-reverse" : "")}>
                        <div className={cn("flex items-center gap-2", isRtl ? "flex-row-reverse" : "")}>
                            <div className="w-7 h-7 rounded-lg bg-emerald-600/20 border border-emerald-600/30 flex items-center justify-center">
                                <Plus className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-base">{t("pipeline.addNewStudent")}</h3>
                        </div>
                        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className={cn("flex-1 overflow-y-auto p-5 space-y-4", isRtl ? "text-right" : "text-left")}>
                        {error && (
                            <div className="bg-red-500/10 dark:bg-red-900/20 border border-red-500/30 dark:border-red-500/40 rounded-xl px-3 py-2.5 text-sm text-red-600 dark:text-red-400">
                                {error}
                            </div>
                        )}

                        <FormField label={`${t("pipeline.fullName")} *`}>
                            <input required value={form.name} onChange={e => update("name", e.target.value)}
                                placeholder={t("pipeline.fullName")}
                                className={inputFieldClass} />
                        </FormField>

                        <FormField label={`${t("pipeline.whatsapp")} *`}>
                            <input
                                dir="ltr"
                                required
                                value={form.whatsapp}
                                onChange={e => update("whatsapp", e.target.value)}
                                placeholder="+20 100 000 0000"
                                className={cn(inputFieldClass, "text-left")}
                            />
                        </FormField>

                        <div className="grid grid-cols-2 gap-3">
                            <FormField label={`${t("pipeline.comingFrom")} *`}>
                                <select required value={form.coming_from} onChange={e => update("coming_from", e.target.value)} className={inputFieldClass}>
                                    <option value="">{t("pipeline.selectSource")}</option>
                                    {COMING_FROM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </FormField>

                            <FormField label={t("pipeline.initialStatus")}>
                                <select value={form.status} onChange={e => update("status", e.target.value)} className={inputFieldClass}>
                                    {KANBAN_STATUSES.map(s => (
                                        <option key={s.key} value={s.key}>{t("pipeline." + getStatusLabelTKey(s.key))}</option>
                                    ))}
                                </select>
                            </FormField>
                        </div>

                        {form.coming_from === "Other" && (
                            <FormField label={t("pipeline.specifySource")}>
                                <input value={form.coming_from_other} onChange={e => update("coming_from_other", e.target.value)}
                                    placeholder={t("pipeline.specifySource")}
                                    className={inputFieldClass} />
                            </FormField>
                        )}

                        <FormField label={`${t("pipeline.description")} *`}>
                            <textarea required value={form.description} onChange={e => update("description", e.target.value)}
                                rows={3} placeholder={t("pipeline.description")}
                                className={cn(inputFieldClass, "resize-none")} />
                        </FormField>

                        <div className="grid grid-cols-2 gap-3">
                            <FormField label={t("pipeline.assignedTo")}>
                                <select value={form.assigned_to} onChange={e => update("assigned_to", e.target.value)} className={inputFieldClass}>
                                    <option value="">{t("pipeline.unassignedOption")}</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </FormField>

                            <FormField label={t("pipeline.followUpDate")}>
                                <input type="date" value={form.follow_up_date} onChange={e => update("follow_up_date", e.target.value)}
                                    className={inputFieldClass} />
                            </FormField>
                        </div>

                        <FormField label={t("pipeline.tags")}>
                            <div className="space-y-2">
                                <div className="flex flex-wrap gap-1.5">
                                    {form.tags.map(tag => (
                                        <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-200 dark:bg-gray-700/60 rounded-lg text-xs text-gray-700 dark:text-gray-300">
                                            {tag}
                                            <button type="button" onClick={() => setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }))}
                                                className={cn("hover:text-red-500 dark:hover:text-red-400", isRtl ? "mr-0.5" : "ml-0.5")}>×</button>
                                        </span>
                                    ))}
                                </div>
                                <div className={cn("flex gap-2", isRtl ? "flex-row-reverse" : "")}>
                                    <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())}
                                        placeholder={t("pipeline.addTagPlaceholder")}
                                        className={cn(inputFieldClass, "flex-1 text-xs")} />
                                    <button type="button" onClick={addTag}
                                        className="px-2.5 py-1.5 bg-gray-600 dark:bg-gray-600 hover:bg-gray-500 text-xs text-white rounded-lg">{t("pipeline.addTag")}</button>
                                </div>
                            </div>
                        </FormField>
                    </form>

                    <div className={cn("px-5 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3", isRtl ? "flex-row-reverse justify-end" : "justify-end")}>
                        <button onClick={onClose} type="button"
                            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-xl transition-colors">
                            {t("pipeline.cancel")}
                        </button>
                        <button onClick={handleSubmit as unknown as React.MouseEventHandler} disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors disabled:opacity-50">
                            <Plus className="h-4 w-4" />
                            {saving ? t("pipeline.creating") : t("pipeline.createLead")}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">{label}</label>
            {children}
        </div>
    );
}
