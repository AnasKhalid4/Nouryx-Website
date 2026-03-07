import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
} from "firebase/storage";
import { storage } from "./config";

// --------------------------------------------------
// USER PROFILE IMAGE
// Mirrors: firebase_storage_service.dart → uploadUserProfileImage
// --------------------------------------------------
export async function uploadUserProfileImage(
    file: File,
    uid: string
): Promise<string> {
    const storageRef = ref(storage, `users/${uid}/profile.jpg`);

    // Try to delete existing first (clean replace)
    try {
        await deleteObject(storageRef);
    } catch {
        // File doesn't exist yet, that's fine
    }

    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
}

// --------------------------------------------------
// SALON LOGO
// Mirrors: firebase_storage_service.dart → uploadSalonLogo
// --------------------------------------------------
export async function uploadSalonLogo(
    file: File,
    uid: string
): Promise<string> {
    const storageRef = ref(storage, `users/${uid}/salon/logo.jpg`);

    try {
        await deleteObject(storageRef);
    } catch {
        // File doesn't exist yet
    }

    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
}

// --------------------------------------------------
// SALON SHOP IMAGES (up to 7)
// Mirrors: firebase_provider_service.dart → uploadMultiple
// --------------------------------------------------
export async function uploadSalonShopImage(
    file: File,
    uid: string,
    index: number
): Promise<string> {
    const storageRef = ref(
        storage,
        `users/${uid}/salon/images/shop_${index}.jpg`
    );
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
}

export async function uploadSalonShopImages(
    files: File[],
    uid: string
): Promise<string[]> {
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
        const url = await uploadSalonShopImage(files[i], uid, i);
        urls.push(url);
    }
    return urls;
}

// --------------------------------------------------
// CHAT IMAGE
// --------------------------------------------------
export async function uploadChatImage(file: File): Promise<string> {
    const timestamp = Date.now();
    const storageRef = ref(storage, `chat_images/${timestamp}.jpg`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
}

// --------------------------------------------------
// REVIEW IMAGE
// --------------------------------------------------
export async function uploadReviewImage(
    file: File,
    bookingId: string
): Promise<string> {
    const storageRef = ref(storage, `reviews/${bookingId}.jpg`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
}

// --------------------------------------------------
// GENERIC UPLOAD / DELETE
// --------------------------------------------------
export async function uploadImage(
    file: File,
    path: string
): Promise<string> {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
}

export async function deleteByPath(path: string): Promise<void> {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
}
