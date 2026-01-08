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
 * رفع صورة واحدة إلى ImgBB
 */
export async function uploadImage(file: File): Promise<UploadResult> {
    try {
        const formData = new FormData();
        formData.append('key', IMGBB_API_KEY);

        // تحويل الملف إلى base64
        const base64 = await fileToBase64(file);
        formData.append('image', base64.split(',')[1]); // إزالة prefix الـ data URL

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
                error: data.error?.message || 'فشل في رفع الصورة',
            };
        }
    } catch (error) {
        console.error('خطأ في رفع الصورة:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'خطأ غير متوقع',
        };
    }
}

/**
 * رفع عدة صور إلى ImgBB
 */
export async function uploadMultipleImages(files: File[]): Promise<UploadMultipleResult> {
    const urls: string[] = [];
    const errors: string[] = [];

    for (const file of files) {
        const result = await uploadImage(file);
        if (result.success && result.url) {
            urls.push(result.url);
        } else {
            errors.push(result.error || 'خطأ غير معروف');
        }
    }

    return {
        success: errors.length === 0,
        urls,
        errors,
    };
}

/**
 * تحويل ملف إلى Base64
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
 * رفع صورة من URL
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
                error: data.error?.message || 'فشل في رفع الصورة',
            };
        }
    } catch (error) {
        console.error('خطأ في رفع الصورة من URL:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'خطأ غير متوقع',
        };
    }
}
