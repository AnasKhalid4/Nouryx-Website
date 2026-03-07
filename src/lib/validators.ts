import { z } from "zod";

// --------------------------------------------------
// LOGIN
// --------------------------------------------------
export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});
export type LoginFormData = z.infer<typeof loginSchema>;

// --------------------------------------------------
// USER SIGNUP
// --------------------------------------------------
export const userSignupSchema = z
    .object({
        fullName: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        phoneNumber: z.string().min(8, "Phone number is required"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
        agreeToTerms: z.boolean().refine((v) => v, "You must agree to the terms"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });
export type UserSignupFormData = z.infer<typeof userSignupSchema>;

// --------------------------------------------------
// SALON SIGNUP STEP 1
// --------------------------------------------------
export const salonSignupStep1Schema = z
    .object({
        shopName: z.string().min(2, "Shop name is required"),
        ownerName: z.string().min(2, "Owner name is required"),
        email: z.string().email("Invalid email address"),
        phoneNumber: z.string().min(8, "Phone number is required"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });
export type SalonSignupStep1Data = z.infer<typeof salonSignupStep1Schema>;

// --------------------------------------------------
// SALON SIGNUP STEP 2
// --------------------------------------------------
export const salonSignupStep2Schema = z.object({
    siretNumber: z.string().min(1, "SIRET number is required"),
    legalStatus: z.string().min(1, "Legal status is required"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    autoAcceptBooking: z.boolean(),
    agreeToTerms: z.boolean().refine((v) => v, "You must agree to the terms"),
});
export type SalonSignupStep2Data = z.infer<typeof salonSignupStep2Schema>;

// --------------------------------------------------
// FORGOT PASSWORD
// --------------------------------------------------
export const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
});
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// --------------------------------------------------
// EDIT PROFILE
// --------------------------------------------------
export const editProfileSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
});
export type EditProfileFormData = z.infer<typeof editProfileSchema>;

// --------------------------------------------------
// ADD/EDIT SERVICE (Salon)
// --------------------------------------------------
export const serviceSchema = z.object({
    name: z.string().min(2, "Service name is required"),
    categoryId: z.string().min(1, "Category is required"),
    price: z.number().min(0.01, "Price must be greater than 0"),
    minutes: z.number().min(10, "Duration must be at least 10 minutes"),
    timeLabel: z.string().min(1, "Duration label is required"),
});
export type ServiceFormData = z.infer<typeof serviceSchema>;

// --------------------------------------------------
// REVIEW
// --------------------------------------------------
export const reviewSchema = z.object({
    rating: z.number().min(1, "Rating is required").max(5),
    comment: z.string().min(5, "Comment must be at least 5 characters"),
});
export type ReviewFormData = z.infer<typeof reviewSchema>;

// --------------------------------------------------
// BOOKING NOTES
// --------------------------------------------------
export const bookingNotesSchema = z.object({
    notes: z.string().optional(),
});
export type BookingNotesFormData = z.infer<typeof bookingNotesSchema>;

// --------------------------------------------------
// CANCEL BOOKING
// --------------------------------------------------
export const cancelBookingSchema = z.object({
    reason: z.string().min(1, "Please select a reason"),
});
export type CancelBookingFormData = z.infer<typeof cancelBookingSchema>;

// --------------------------------------------------
// CANCEL REASONS
// --------------------------------------------------
export const USER_CANCEL_REASONS = [
    "Schedule conflict",
    "Found another salon",
    "Changed my mind",
    "Personal emergency",
    "Other",
] as const;

export const SALON_CANCEL_REASONS = [
    "Salon is fully booked",
    "Staff unavailable",
    "Salon closed",
    "Service unavailable",
    "Other",
] as const;
