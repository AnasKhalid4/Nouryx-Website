"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Plus,
    Loader2,
    Pencil,
    Trash2,
    X,
    Users,
    Upload,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
    useAllTeamMembers,
    useAddTeamMember,
    useUpdateTeamMember,
    useDeleteTeamMember,
} from "@/hooks/use-team-members";
import { useWeeklySchedule } from "@/hooks/use-schedule";
import { useSalonServices } from "@/hooks/use-salons";
import Image from "next/image";
import type { TeamMemberModel, TimeRange } from "@/types/team-member";
import { useLocale } from "@/hooks/use-locale";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

interface MemberFormData {
    name: string;
    role: string;
    enabled: boolean;
    serviceIds: string[];
    schedule: Record<string, TimeRange[]>;
    imageFile: File | null;
}

const emptyForm: MemberFormData = {
    name: "",
    role: "",
    enabled: true,
    serviceIds: [],
    schedule: {},
    imageFile: null,
};

export default function TeamMembersPage() {
    const { uid } = useAuth();
    const { data: members, isLoading } = useAllTeamMembers(uid || undefined);
    const { data: weeklySchedule } = useWeeklySchedule(uid || undefined);
    const { data: salonServices } = useSalonServices(uid || "");
    const addMember = useAddTeamMember();
    const updateMember = useUpdateTeamMember();
    const deleteMember = useDeleteTeamMember();
    const { t } = useLocale();

    const [showForm, setShowForm] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMemberModel | null>(null);
    const [form, setForm] = useState<MemberFormData>(emptyForm);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const openAddForm = () => {
        setEditingMember(null);
        // Pre-fill schedule from salon schedule
        const defaultSchedule: Record<string, TimeRange[]> = {};
        if (weeklySchedule) {
            for (const day of DAYS) {
                defaultSchedule[day] = weeklySchedule.schedule[day] || [{ start: "closed", end: "closed" }];
            }
        }
        setForm({ ...emptyForm, schedule: defaultSchedule });
        setShowForm(true);
    };

    const openEditForm = (member: TeamMemberModel) => {
        setEditingMember(member);
        setForm({
            name: member.name,
            role: member.role,
            enabled: member.enabled,
            serviceIds: [...member.serviceIds],
            schedule: { ...member.schedule },
            imageFile: null,
        });
        setShowForm(true);
    };

    const handleSubmit = async () => {
        if (!uid || !form.name.trim()) return;

        if (editingMember) {
            await updateMember.mutateAsync({
                salonId: uid,
                memberId: editingMember.id,
                data: {
                    name: form.name,
                    role: form.role,
                    enabled: form.enabled,
                    serviceIds: form.serviceIds,
                    schedule: form.schedule,
                },
                imageFile: form.imageFile,
            });
        } else {
            await addMember.mutateAsync({
                salonId: uid,
                data: {
                    name: form.name,
                    role: form.role,
                    enabled: form.enabled,
                    serviceIds: form.serviceIds,
                    schedule: form.schedule,
                },
                imageFile: form.imageFile,
            });
        }
        setShowForm(false);
        setForm(emptyForm);
    };

    const handleDelete = async (memberId: string) => {
        if (!uid) return;
        await deleteMember.mutateAsync({ salonId: uid, memberId });
        setDeleteConfirm(null);
    };

    const toggleServiceId = (sid: string) => {
        setForm((prev) => ({
            ...prev,
            serviceIds: prev.serviceIds.includes(sid)
                ? prev.serviceIds.filter((s) => s !== sid)
                : [...prev.serviceIds, sid],
        }));
    };

    const setDayClosed = (day: string, isClosed: boolean) => {
        setForm(prev => ({
            ...prev,
            schedule: {
                ...prev.schedule,
                [day]: isClosed ? [{ start: "closed", end: "closed" }] : [{ start: "09:00", end: "18:00" }]
            }
        }));
    };

    const updateTimeRange = (day: string, index: number, field: "start" | "end", value: string) => {
        setForm(prev => {
            const daySchedule = [...(prev.schedule[day] || [])];
            if (daySchedule.length > index) {
                daySchedule[index] = { ...daySchedule[index], [field]: value };
            }
            return { ...prev, schedule: { ...prev.schedule, [day]: daySchedule } };
        });
    };

    const addTimeRange = (day: string) => {
        setForm(prev => {
            const daySchedule = [...(prev.schedule[day] || [])];
            if (daySchedule.length >= 5) return prev;
            const lastEnd = daySchedule.length > 0 ? daySchedule[daySchedule.length - 1].end : "09:00";
            return { ...prev, schedule: { ...prev.schedule, [day]: [...daySchedule, { start: lastEnd, end: "18:00" }] } };
        });
    };

    const removeTimeRange = (day: string, index: number) => {
        setForm(prev => {
            const daySchedule = [...(prev.schedule[day] || [])];
            daySchedule.splice(index, 1);
            if (daySchedule.length === 0) daySchedule.push({ start: "closed", end: "closed" });
            return { ...prev, schedule: { ...prev.schedule, [day]: daySchedule } };
        });
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">{t.dashboard.teamMembers.title}</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {t.dashboard.teamMembers.subtitle}
                    </p>
                </div>
                <Button
                    onClick={openAddForm}
                    className="bg-[#C9AA8B] hover:bg-[#B8956F] text-white rounded-xl"
                >
                    <Plus className="h-4 w-4 mr-1" />
                    {t.dashboard.teamMembers.addMember}
                </Button>
            </div>

            {/* Members List */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-[#C9AA8B]" />
                </div>
            ) : !members || members.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-border/50">
                    <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm font-medium text-foreground">No team members yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Add staff to manage their schedules</p>
                    <Button variant="outline" size="sm" onClick={openAddForm} className="mt-4 rounded-lg">
                        <Plus className="h-4 w-4 mr-1.5" /> Add Member
                    </Button>
                </div>
            ) : (
                <div className="">
                    {members.map((member) => (
                        <div
                            key={member.id}
                            className="flex items-center gap-4 p-4 bg-white rounded-xl border border-border/50 hover:border-[#C9AA8B]/30 transition-colors"
                        >
                            <div className="h-14 w-14 rounded-full bg-[#E8D5C0] flex items-center justify-center overflow-hidden flex-shrink-0">
                                {member.image ? (
                                    <Image src={member.image} alt={member.name} width={56} height={56} className="object-cover rounded-full" />
                                ) : (
                                    <span className="text-xl font-bold text-[#8B7355]">{member.name.charAt(0)}</span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="font-medium text-foreground">{member.name}</p>
                                    <Badge variant={member.enabled ? "default" : "secondary"} className={member.enabled ? "bg-green-100 text-green-700 text-xs" : "text-xs"}>
                                        {member.enabled ? t.dashboard.teamMembers.active : t.dashboard.teamMembers.closed}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{member.role}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {member.serviceIds.length} {t.salonDetail.services.toLowerCase()}
                                </p>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => openEditForm(member)}
                                    className="h-9 w-9 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
                                >
                                    <Pencil className="h-4 w-4 text-muted-foreground" />
                                </button>
                                {deleteConfirm === member.id ? (
                                    <div className="flex gap-1">
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleDelete(member.id)}
                                            disabled={deleteMember.isPending}
                                            className="h-9 text-xs"
                                        >
                                            {deleteMember.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : t.common.confirm}
                                        </Button>
                                        <button
                                            onClick={() => setDeleteConfirm(null)}
                                            className="h-9 w-9 rounded-lg flex items-center justify-center hover:bg-muted"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setDeleteConfirm(member.id)}
                                        className="h-9 w-9 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4 text-red-400" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add / Edit Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
                            <div>
                                <h2 className="text-lg font-bold text-foreground">{editingMember ? t.dashboard.teamMembers.editMember : t.dashboard.teamMembers.addMember}</h2>
                                <p className="text-xs text-muted-foreground mt-0.5"></p>
                            </div>
                            <button onClick={() => setShowForm(false)} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
                                <X className="h-4 w-4 text-muted-foreground" />
                            </button>
                        </div>

                        {/* Modal Body — scrollable */}
                        <div className="overflow-y-auto max-h-[calc(90vh-140px)] px-6 py-5 space-y-6">
                            {/* Avatar Upload — centered */}
                            <div className="flex flex-col items-center">
                                <div className="relative group cursor-pointer" onClick={() => document.getElementById("member-image-input")?.click()}>
                                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#E8D5C0] to-[#F5EDE6] flex items-center justify-center overflow-hidden ring-4 ring-white shadow-lg">
                                        {form.imageFile ? (
                                            <img src={URL.createObjectURL(form.imageFile)} alt="Preview" className="h-24 w-24 rounded-full object-cover" />
                                        ) : editingMember?.image ? (
                                            <Image src={editingMember.image} alt={editingMember.name} width={96} height={96} className="object-cover rounded-full" />
                                        ) : (
                                            <span className="text-3xl font-bold text-[#B8956F]">
                                                {form.name ? form.name.charAt(0).toUpperCase() : <Upload className="h-6 w-6 text-[#C9AA8B]" />}
                                            </span>
                                        )}
                                    </div>
                                    {/* Camera overlay */}
                                    <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Upload className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 h-7 w-7 rounded-full bg-[#C9AA8B] flex items-center justify-center ring-2 ring-white shadow">
                                        <Pencil className="h-3 w-3 text-white" />
                                    </div>
                                </div>
                                <input
                                    id="member-image-input"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => setForm({ ...form, imageFile: e.target.files?.[0] || null })}
                                />
                                <p className="text-xs text-muted-foreground mt-2.5">{t.dashboard.teamMembers.clickToUpload}</p>
                            </div>

                            {/* Name + Role — side by side */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-1.5 block">{t.dashboard.teamMembers.nameStr}</label>
                                    <input
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Sarah"
                                        className="w-full rounded-xl border border-border/60 bg-[#FDFBF9] px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-[#C9AA8B]/40 focus:border-[#C9AA8B] transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-1.5 block">{t.dashboard.teamMembers.role}</label>
                                    <input
                                        value={form.role}
                                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                                        placeholder="Hair Stylist"
                                        className="w-full rounded-xl border border-border/60 bg-[#FDFBF9] px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-[#C9AA8B]/40 focus:border-[#C9AA8B] transition-all"
                                    />
                                </div>
                            </div>

                            {/* Active Toggle */}
                            <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-[#FDFBF9] border border-border/30">
                                <div>
                                    <p className="text-sm font-medium text-foreground">{t.dashboard.teamMembers.active}</p>
                                    <p className="text-xs text-muted-foreground">{t.dashboard.teamMembers.visibleToDocs}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, enabled: !form.enabled })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${form.enabled ? "bg-[#C9AA8B]" : "bg-gray-300"}`}
                                >
                                    <span
                                        className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200"
                                        style={{ transform: form.enabled ? "translateX(22px)" : "translateX(4px)" }}
                                    />
                                </button>
                            </div>

                            {/* Services — chip selector */}
                            <div>
                                <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-2.5 block">
                                    {t.dashboard.teamMembers.assignedServices}
                                    {form.serviceIds.length > 0 ? (
                                        <span className="ml-2 text-[#C9AA8B] normal-case font-normal">({form.serviceIds.length} {t.dashboard.teamMembers.selected})</span>
                                    ) : (
                                        <span className="ml-2 text-red-400 normal-case font-normal">{t.dashboard.teamMembers.atLeastOneReq}</span>
                                    )}
                                </label>
                                {salonServices && salonServices.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {salonServices.map((s) => {
                                            const isSelected = form.serviceIds.includes(s.id);
                                            return (
                                                <button
                                                    key={s.id}
                                                    type="button"
                                                    onClick={() => toggleServiceId(s.id)}
                                                    className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 border ${isSelected
                                                        ? "bg-[#C9AA8B] text-white border-[#C9AA8B] shadow-sm"
                                                        : "bg-white text-foreground/70 border-border/50 hover:border-[#C9AA8B]/40 hover:bg-[#FDFBF9]"
                                                        }`}
                                                >
                                                    {isSelected && <span className="mr-1">✓</span>}
                                                    {s.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 rounded-xl border border-dashed border-border/50 bg-[#FDFBF9]">
                                        <p className="text-xs text-muted-foreground">{t.dashboard.teamMembers.noServicesFound}</p>
                                    </div>
                                )}
                            </div>

                            {/* Weekly Schedule — compact table */}
                            <div>
                                <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-2.5 block">{t.dashboard.teamMembers.workingHours}</label>
                                <div className="rounded-xl border border-border/40 overflow-hidden">
                                    {DAYS.map((day, i) => {
                                        const ranges = form.schedule[day] || [];
                                        const isClosed = ranges.length === 0 || ranges[0]?.start === "closed";

                                        return (
                                            <div key={day} className={`flex flex-col gap-2 px-4 py-3 ${i < DAYS.length - 1 ? "border-b border-border/20" : ""} ${i % 2 === 0 ? "bg-[#FDFBF9]" : "bg-white"}`}>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-semibold text-foreground capitalize w-[85px]">{t.dashboard.schedule.days[day as keyof typeof t.dashboard.schedule.days]}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDayClosed(day, !isClosed)}
                                                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 flex-shrink-0 ${!isClosed ? "bg-[#C9AA8B]" : "bg-gray-300"}`}
                                                    >
                                                        <span
                                                            className="inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200"
                                                            style={{ transform: !isClosed ? "translateX(16px)" : "translateX(3px)" }}
                                                        />
                                                    </button>
                                                    {isClosed && (
                                                        <span className="text-xs text-red-400/70 ml-auto font-medium">{t.dashboard.teamMembers.closed}</span>
                                                    )}
                                                </div>

                                                {!isClosed && (
                                                    <div className="pl-[76px] flex flex-col gap-2">
                                                        {ranges.map((range, rangeIndex) => (
                                                            <div key={rangeIndex} className="flex items-center gap-2">
                                                                <input
                                                                    type="time"
                                                                    value={range.start}
                                                                    onChange={(e) => updateTimeRange(day, rangeIndex, 'start', e.target.value)}
                                                                    className="text-xs border border-border/40 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-[#C9AA8B] w-[85px]"
                                                                />
                                                                <span className="text-xs text-muted-foreground/60">–</span>
                                                                <input
                                                                    type="time"
                                                                    value={range.end}
                                                                    onChange={(e) => updateTimeRange(day, rangeIndex, 'end', e.target.value)}
                                                                    className="text-xs border border-border/40 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-[#C9AA8B] w-[85px]"
                                                                />
                                                                {ranges.length > 1 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeTimeRange(day, rangeIndex)}
                                                                        className="p-1 text-red-500/50 hover:text-red-500 transition-colors ml-1"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                        {ranges.length < 5 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => addTimeRange(day)}
                                                                className="text-xs text-[#C9AA8B] hover:text-[#B8956F] font-medium flex items-center gap-1 w-fit mt-0.5"
                                                            >
                                                                <Plus className="h-3 w-3" /> {t.dashboard.teamMembers.addTimeRange}
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer — sticky */}
                        <div className="flex gap-3 px-6 py-4 border-t border-border/30 bg-[#FDFBF9]">
                            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1 rounded-xl h-11 font-medium">
                                {t.common.cancel}
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={!form.name.trim() || form.serviceIds.length === 0 || addMember.isPending || updateMember.isPending}
                                className="flex-1 bg-[#C9AA8B] hover:bg-[#B8956F] text-white rounded-xl h-11 font-semibold transition-colors"
                            >
                                {(addMember.isPending || updateMember.isPending) && (
                                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                                )}
                                {editingMember ? t.dashboard.teamMembers.saveChanges : t.dashboard.teamMembers.addMember}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
