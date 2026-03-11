// TypeScript types mirroring team_member_model.dart + weekly_schedule_model.dart

export interface TimeRange {
    start: string; // "09:00" or "closed"
    end: string;   // "18:00" or "closed"
}

export interface WeeklyScheduleModel {
    schedule: Record<string, TimeRange[]>;
}

export interface TeamMemberModel {
    id: string;
    name: string;
    role: string;
    image: string;
    enabled: boolean;
    schedule: Record<string, TimeRange[]>; // day → time ranges
    serviceIds: string[];
}

// Snapshot stored inside booking doc
export interface BookingTeamMember {
    memberId: string;
    name: string;
    image: string;
    role: string;
}
