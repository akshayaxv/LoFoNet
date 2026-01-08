const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;
const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';

export interface UploadResult {
    success: boolean;
    url?: string;
    error?: string;
}

export interface UploadMultipleResult {
    success: boolean;
    urls: string[];
    errors: string[];
}

/**
 * Upload a single image to ImgBB
 */
export async function uploadImage(file: File): Promise<UploadResult> {
    try {
        const formData = new FormData();
        formData.append('key', IMGBB_API_KEY);

        // Convert file to base64
        const base64 = await fileToBase64(file);
        formData.append('image', base64.split(',')[1]); // Remove data URL prefix

        const response = await fetch(IMGBB_UPLOAD_URL, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (data.success) {
            return {
                success: true,
                url: data.data.url,
            };
        } else {
            return {
                success: false,
                error: data.error?.message || 'Failed to upload image',
            };
        }
    } catch (error) {
        console.error('Error uploading image:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unexpected error',
        };
    }
}

/**
 * Upload multiple images to ImgBB
 */
export async function uploadMultipleImages(files: File[]): Promise<UploadMultipleResult> {
    const urls: string[] = [];
    const errors: string[] = [];

    for (const file of files) {
        const result = await uploadImage(file);
        if (result.success && result.url) {
            urls.push(result.url);
        } else {
            errors.push(result.error || 'Unknown error');
        }
    }

    return {
        success: errors.length === 0,
        urls,
        errors,
    };
}

/**
 * Convert file to Base64
 */
function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
}

/**
 * Upload image from URL
 */
export async function uploadImageFromUrl(imageUrl: string): Promise<UploadResult> {
    try {
        const formData = new FormData();
        formData.append('key', IMGBB_API_KEY);
        formData.append('image', imageUrl);

        const response = await fetch(IMGBB_UPLOAD_URL, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (data.success) {
            return {
                success: true,
                url: data.data.url,
            };
        } else {
            return {
                success: false,
                error: data.error?.message || 'Failed to upload image',
            };
        }
    } catch (error) {
        console.error('Error uploading image from URL:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unexpected error',
        };
    }
}