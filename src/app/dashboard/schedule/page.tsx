"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Clock, Loader2, Save } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useWeeklySchedule, useSaveFullSchedule } from "@/hooks/use-schedule";
import type { TimeRange } from "@/types/team-member";
import { useLocale } from "@/hooks/use-locale";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export default function SchedulePage() {
    const { uid } = useAuth();
    const { data: weeklySchedule, isLoading } = useWeeklySchedule(uid || undefined);
    const saveSchedule = useSaveFullSchedule();
    const { t } = useLocale();

    const [localSchedule, setLocalSchedule] = useState<Record<string, TimeRange[]>>({});
    const [hasChanges, setHasChanges] = useState(false);

    // Initialize local state when data loads
    useEffect(() => {
        if (weeklySchedule) {
            const schedule: Record<string, TimeRange[]> = {};
            for (const day of DAYS) {
                schedule[day] = weeklySchedule.schedule[day] || [{ start: "closed", end: "closed" }];
            }
            setLocalSchedule(schedule);
            setHasChanges(false);
        } else if (!isLoading) {
            // No schedule exists yet — set defaults
            const schedule: Record<string, TimeRange[]> = {};
            for (const day of DAYS) {
                schedule[day] = [{ start: "closed", end: "closed" }];
            }
            setLocalSchedule(schedule);
        }
    }, [weeklySchedule, isLoading]);

    const updateDay = (day: string, start: string, end: string) => {
        setLocalSchedule((prev) => ({
            ...prev,
            [day]: start === "closed" ? [{ start: "closed", end: "closed" }] : [{ start, end }],
        }));
        setHasChanges(true);
    };

    const toggleDay = (day: string, open: boolean) => {
        if (open) {
            updateDay(day, "09:00", "18:00");
        } else {
            updateDay(day, "closed", "closed");
        }
    };

    const handleSave = async () => {
        if (!uid) return;
        await saveSchedule.mutateAsync({
            salonId: uid,
            schedule: localSchedule,
        });
        setHasChanges(false);
    };

    // Quick presets
    const applyPreset = (preset: "weekdays" | "everyday" | "allClosed") => {
        const schedule: Record<string, TimeRange[]> = {};
        for (const day of DAYS) {
            if (preset === "allClosed") {
                schedule[day] = [{ start: "closed", end: "closed" }];
            } else if (preset === "everyday") {
                schedule[day] = [{ start: "09:00", end: "18:00" }];
            } else {
                // weekdays only
                const isWeekend = day === "saturday" || day === "sunday";
                schedule[day] = isWeekend
                    ? [{ start: "closed", end: "closed" }]
                    : [{ start: "09:00", end: "18:00" }];
            }
        }
        setLocalSchedule(schedule);
        setHasChanges(true);
    };

    if (isLoading) {
        return (
            <div className="p-6 flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-[#C9AA8B]" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <Clock className="h-6 w-6" />
                        {t.dashboard.schedule.title}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {t.dashboard.schedule.subtitle}
                    </p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={!hasChanges || saveSchedule.isPending}
                    className="bg-[#C9AA8B] hover:bg-[#B8956F] text-white rounded-xl"
                >
                    {saveSchedule.isPending ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4 mr-1" />
                    )}
                    {t.dashboard.schedule.saveChanges}
                </Button>
            </div>

            {/* Quick Presets */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => applyPreset("weekdays")}
                    className="text-xs px-3 py-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors font-medium"
                >
                    {t.dashboard.schedule.standardHours}
                </button>
                <button
                    onClick={() => applyPreset("everyday")}
                    className="text-xs px-3 py-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors font-medium"
                >
                    {t.dashboard.schedule.alwaysOpen}
                </button>
                <button
                    onClick={() => applyPreset("allClosed")}
                    className="text-xs px-3 py-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors font-medium"
                >
                    {t.dashboard.schedule.closed}
                </button>
            </div>

            {/* Schedule Table */}
            <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
                {DAYS.map((day, i) => {
                    const ranges = localSchedule[day];
                    const isClosed = !ranges || ranges.length === 0 || ranges[0]?.start === "closed";
                    const start = isClosed ? "" : ranges[0]?.start || "";
                    const end = isClosed ? "" : ranges[0]?.end || "";

                    return (
                        <div
                            key={day}
                            className={`flex items-center gap-4 px-5 py-4 ${i < DAYS.length - 1 ? "border-b border-border/30" : ""}`}
                        >
                            <span className="text-sm font-semibold text-foreground capitalize w-28">{t.dashboard.schedule.days[day as keyof typeof t.dashboard.schedule.days]}</span>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <div
                                    className={`relative w-10 h-5 rounded-full transition-colors ${isClosed ? "bg-gray-200" : "bg-[#C9AA8B]"}`}
                                    onClick={() => toggleDay(day, isClosed)}
                                >
                                    <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${isClosed ? "left-0.5" : "left-5.5"}`} />
                                </div>
                                <span className={`text-xs font-medium ${isClosed ? "text-red-400" : "text-green-600"}`}>
                                    {isClosed ? t.dashboard.schedule.closed : "Open"}
                                </span>
                            </label>

                            {!isClosed && (
                                <div className="flex items-center gap-2 ml-auto">
                                    <input
                                        type="time"
                                        value={start}
                                        onChange={(e) => updateDay(day, e.target.value, end)}
                                        className="text-sm border border-border/50 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#C9AA8B]"
                                    />
                                    <span className="text-xs text-muted-foreground">to</span>
                                    <input
                                        type="time"
                                        value={end}
                                        onChange={(e) => updateDay(day, start, e.target.value)}
                                        className="text-sm border border-border/50 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#C9AA8B]"
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {hasChanges && (
                <p className="text-xs text-amber-600 mt-3 text-center">
                    You have unsaved changes
                </p>
            )}
        </div>
    );
}
