import {
    signInWithEmailAndPassword,
    signInWithPhoneNumber,
    PhoneAuthProvider,
    linkWithCredential,
    EmailAuthProvider,
    sendPasswordResetEmail,
    signOut,
    deleteUser,
    RecaptchaVerifier,
    ConfirmationResult,
    User,
} from "firebase/auth";
import { doc, updateDoc, arrayUnion, arrayRemove, deleteDoc } from "firebase/firestore";
import { auth, db } from "./config";

// --------------------------------------------------
// LOGIN
// --------------------------------------------------
export async function loginUser(email: string, password: string): Promise<User> {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    if (!cred.user) throw new Error("Login failed");
    return cred.user;
}

// --------------------------------------------------
// RECAPTCHA VERIFIER — singleton with proper lifecycle
// --------------------------------------------------
let recaptchaVerifierInstance: RecaptchaVerifier | null = null;

/**
 * Creates (or re-creates) a RecaptchaVerifier and renders it.
 * Must call this before sendOtp every time to get a fresh token.
 */
export function createRecaptchaVerifier(
    containerId: string
): RecaptchaVerifier {
    // Clear any existing verifier to avoid stale tokens
    if (recaptchaVerifierInstance) {
        try {
            recaptchaVerifierInstance.clear();
        } catch {
            // ignore cleanup errors
        }
        recaptchaVerifierInstance = null;
    }

    recaptchaVerifierInstance = new RecaptchaVerifier(auth, containerId, {
        size: "invisible",
        callback: () => {
            // reCAPTCHA solved — this fires automatically for invisible
        },
        "expired-callback": () => {
            // Token expired — will be recreated on next attempt
            console.warn("reCAPTCHA token expired, will recreate on next attempt");
        },
    });

    return recaptchaVerifierInstance;
}

/**
 * Cleanup the reCAPTCHA verifier (call after OTP flow completes or fails)
 */
export function clearRecaptchaVerifier(): void {
    if (recaptchaVerifierInstance) {
        try {
            recaptchaVerifierInstance.clear();
        } catch {
            // ignore
        }
        recaptchaVerifierInstance = null;
    }
}

// --------------------------------------------------
// SEND OTP
// --------------------------------------------------
export async function sendOtp(
    phone: string,
    recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
    // Explicitly render the verifier first to generate a valid token
    await recaptchaVerifier.render();
    return await signInWithPhoneNumber(auth, phone, recaptchaVerifier);
}

// --------------------------------------------------
// VERIFY OTP + CREATE EMAIL/PASSWORD USER
// Mirrors: firebase_auth_service.dart → verifyOtpAndCreateUser
// --------------------------------------------------
export async function verifyOtpAndCreateUser(
    confirmationResult: ConfirmationResult,
    otp: string,
    email: string,
    password: string
): Promise<User> {
    // 1. Verify phone OTP
    const phoneUserCred = await confirmationResult.confirm(otp);
    if (!phoneUserCred.user) throw new Error("OTP verification failed");

    // 2. Link email/password credential
    const emailCredential = EmailAuthProvider.credential(email, password);
    await linkWithCredential(phoneUserCred.user, emailCredential);

    return phoneUserCred.user;
}

// --------------------------------------------------
// VERIFY OTP ONLY (No user creation - for other flows)
// --------------------------------------------------
export async function verifyOtpOnly(
    confirmationResult: ConfirmationResult,
    otp: string
): Promise<User> {
    const result = await confirmationResult.confirm(otp);
    if (!result.user) throw new Error("OTP verification failed");
    return result.user;
}

// --------------------------------------------------
// PASSWORD RESET
// --------------------------------------------------
export async function sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email, {
        url: typeof window !== "undefined"
            ? `${window.location.origin}/login`
            : "https://app.nouryx.com/login",
    });
}

// --------------------------------------------------
// FCM TOKEN MANAGEMENT
// --------------------------------------------------
export async function saveFcmToken(uid: string, token: string): Promise<void> {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { fcmTokens: arrayUnion(token) });
}

export async function removeFcmToken(uid: string, token: string): Promise<void> {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { fcmTokens: arrayRemove(token) });
}

// --------------------------------------------------
// LOGOUT & DELETE ACCOUNT
// --------------------------------------------------
export async function signOutUser(): Promise<void> {
    await signOut(auth);
}

export async function deleteUserAccount(): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("No authenticated user");

    // 1. Delete Firestore user document
    await deleteDoc(doc(db, "users", user.uid));

    // 2. Delete Firebase Auth account
    await deleteUser(user);
}
