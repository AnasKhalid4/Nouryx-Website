import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SalonModel } from "@/types/salon";
import type { SalonService } from "@/types/user";
import type { TeamMemberModel } from "@/types/team-member";

interface BookingState {
    // Selected salon
    salon: SalonModel | null;
    // Selected services
    selectedServices: SalonService[];
    // Selected team member
    selectedTeamMember: TeamMemberModel | null;
    // Schedule
    selectedDate: string | null; // ISO date string
    selectedTime: string | null; // "10:00"
    // Notes
    notes: string;

    // Actions
    setSalon: (salon: SalonModel) => void;
    toggleService: (service: SalonService) => void;
    setTeamMember: (member: TeamMemberModel | null) => void;
    setDate: (date: string) => void;
    setTime: (time: string) => void;
    setNotes: (notes: string) => void;
    clearBooking: () => void;

    // Computed
    totalPrice: () => number;
    totalMinutes: () => number;
}

export const useBookingStore = create<BookingState>()(
    persist(
        (set, get) => ({
            salon: null,
            selectedServices: [],
            selectedTeamMember: null,
            selectedDate: null,
            selectedTime: null,
            notes: "",

            setSalon: (salon) => set({ salon }),

            toggleService: (service) => {
                const current = get().selectedServices;

                // Check if adding from a different salon. If so, clear first.
                if (current.length > 0 && current[0].providerId !== service.providerId) {
                    set({ selectedServices: [service], selectedTeamMember: null });
                    return;
                }

                const exists = current.find((s) => s.id === service.id);
                if (exists) {
                    set({
                        selectedServices: current.filter((s) => s.id !== service.id),
                        selectedTeamMember: null, // Clear team member when services change
                    });
                } else {
                    set({
                        selectedServices: [...current, service],
                        selectedTeamMember: null, // Clear team member when services change
                    });
                }
            },

            setTeamMember: (member) => set({ selectedTeamMember: member }),

            setDate: (date) => set({ selectedDate: date, selectedTime: null }),
            setTime: (time) => set({ selectedTime: time }),
            setNotes: (notes) => set({ notes }),

            clearBooking: () =>
                set({
                    salon: null,
                    selectedServices: [],
                    selectedTeamMember: null,
                    selectedDate: null,
                    selectedTime: null,
                    notes: "",
                }),

            totalPrice: () => get().selectedServices.reduce((sum, s) => sum + s.price, 0),
            totalMinutes: () =>
                get().selectedServices.reduce((sum, s) => sum + s.minutes, 0),
        }),
        { name: "nouryx-booking-draft" }
    )
);
