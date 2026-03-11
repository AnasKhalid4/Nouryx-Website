// Pure utility functions for slot generation — no Firebase dependency
// Mirrors the logic from booking_viewmodel.dart in the mobile app

export interface TimeRange {
    start: string; // "HH:mm" or "closed"
    end: string;
}

const SLOT_INTERVAL = 15; // minutes

/**
 * Maps JS Date.getDay() (0=Sun) to weekday key matching Firestore
 */
export function getWeekdayKey(date: Date): string {
    const map: Record<number, string> = {
        0: "sunday",
        1: "monday",
        2: "tuesday",
        3: "wednesday",
        4: "thursday",
        5: "friday",
        6: "saturday",
    };
    return map[date.getDay()];
}

/**
 * Convert "HH:mm" to total minutes since midnight
 */
function toMinutes(time: string): number {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
}

/**
 * Convert total minutes to "HH:mm" string
 */
function fromMinutes(mins: number): string {
    const h = Math.floor(mins / 60)
        .toString()
        .padStart(2, "0");
    const m = (mins % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
}

/**
 * Expand time ranges into 15-minute slot strings.
 * e.g. [{ start: "09:00", end: "12:00" }] → ["09:00", "09:15", "09:30", ..., "11:45"]
 * Returns empty array if any range starts with "closed".
 */
export function expandRangesToSlots(ranges: TimeRange[]): string[] {
    const slots: string[] = [];

    for (const r of ranges) {
        if (r.start === "closed") return [];

        let cursor = toMinutes(r.start);
        const end = toMinutes(r.end);

        while (cursor < end) {
            slots.push(fromMinutes(cursor));
            cursor += SLOT_INTERVAL;
        }
    }

    return slots;
}

/**
 * Return only slots that appear in both salon and member slot arrays.
 */
export function intersectSlots(
    salonSlots: string[],
    memberSlots: string[]
): string[] {
    const memberSet = new Set(memberSlots);
    return salonSlots.filter((slot) => memberSet.has(slot));
}

/**
 * Keep only start slots where the full service duration fits within
 * contiguous allowed slots.
 */
export function filterByDuration(
    allowedSlots: string[],
    durationMinutes: number
): string[] {
    const allowedSet = new Set(allowedSlots);
    const validStarts: string[] = [];

    for (const slot of allowedSlots) {
        let cursor = toMinutes(slot);
        const endTime = cursor + durationMinutes;
        let fits = true;

        while (cursor < endTime) {
            if (!allowedSet.has(fromMinutes(cursor))) {
                fits = false;
                break;
            }
            cursor += SLOT_INTERVAL;
        }

        if (fits) validStarts.push(slot);
    }

    return validStarts;
}

/**
 * Check if a specific slot is in the past (for today).
 */
export function isSlotPast(selectedDate: Date, slot: string): boolean {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const selected = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
    );

    if (selected.getTime() > today.getTime()) return false;
    if (selected.getTime() < today.getTime()) return true;

    // Same day — check if slot time has passed
    const [h, m] = slot.split(":").map(Number);
    const slotDate = new Date(
        selected.getFullYear(),
        selected.getMonth(),
        selected.getDate(),
        h,
        m
    );
    return slotDate <= now;
}

/**
 * Check if any 15-min interval within the service duration is blocked.
 */
export function isSlotDisabled(
    slot: string,
    durationMinutes: number,
    disabledSlots: Record<string, boolean>
): boolean {
    let cursor = toMinutes(slot);
    const endTime = cursor + durationMinutes;

    while (cursor < endTime) {
        const key = fromMinutes(cursor);
        if (disabledSlots[key] === true) return true;
        cursor += SLOT_INTERVAL;
    }

    return false;
}

/**
 * Check if ranges indicate "closed" for a day.
 */
export function isDayClosed(ranges: TimeRange[] | undefined): boolean {
    if (!ranges || ranges.length === 0) return true;
    return ranges[0].start === "closed";
}

/**
 * Generate valid booking slots for a given day, considering:
 * - Salon schedule
 * - Team member schedule
 * - Service duration
 * Returns empty array if salon or member is closed that day.
 */
export function generateBookingSlots(
    salonRanges: TimeRange[] | undefined,
    memberRanges: TimeRange[] | undefined,
    durationMinutes: number
): string[] {
    if (isDayClosed(salonRanges) || isDayClosed(memberRanges)) {
        return [];
    }

    const salonSlots = expandRangesToSlots(salonRanges!);
    if (salonSlots.length === 0) return [];

    const memberSlots = expandRangesToSlots(memberRanges!);
    if (memberSlots.length === 0) return [];

    const allowed = intersectSlots(salonSlots, memberSlots);
    if (allowed.length === 0) return [];

    return filterByDuration(allowed, durationMinutes);
}
