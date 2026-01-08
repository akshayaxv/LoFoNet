/**
 * Advanced Image Similarity Algorithm
 * Uses Perceptual Hash (pHash) and Color Histogram
 */

// ==================== Perceptual Hash (pHash) ====================

/**
 * Load image and convert to ImageData
 */
async function loadImage(url: string): Promise<ImageData | null> {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                resolve(null);
                return;
            }

            // Resize image to 32x32 for pHash
            canvas.width = 32;
            canvas.height = 32;
            ctx.drawImage(img, 0, 0, 32, 32);

            resolve(ctx.getImageData(0, 0, 32, 32));
        };

        img.onerror = () => {
            console.error('Error loading image:', url);
            resolve(null);
        };

        img.src = url;
    });
}

/**
 * Convert image to grayscale
 */
function toGrayscale(imageData: ImageData): number[] {
    const gray: number[] = [];
    const { data } = imageData;

    for (let i = 0; i < data.length; i += 4) {
        // Use Luminosity formula to get grayscale
        const grayValue = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        gray.push(grayValue);
    }

    return gray;
}

/**
 * Apply simplified DCT (Discrete Cosine Transform)
 */
function simpleDCT(matrix: number[], size: number): number[] {
    const dct: number[] = [];

    for (let u = 0; u < 8; u++) {
        for (let v = 0; v < 8; v++) {
            let sum = 0;
            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    const idx = i * size + j;
                    sum += matrix[idx] *
                        Math.cos((2 * i + 1) * u * Math.PI / (2 * size)) *
                        Math.cos((2 * j + 1) * v * Math.PI / (2 * size));
                }
            }

            const cu = u === 0 ? 1 / Math.sqrt(2) : 1;
            const cv = v === 0 ? 1 / Math.sqrt(2) : 1;
            dct.push(cu * cv * sum * 2 / size);
        }
    }

    return dct;
}

/**
 * Calculate pHash for image
 */
export async function calculatePHash(imageUrl: string): Promise<string | null> {
    try {
        const imageData = await loadImage(imageUrl);
        if (!imageData) return null;

        // Convert to grayscale
        const gray = toGrayscale(imageData);

        // Apply DCT
        const dct = simpleDCT(gray, 32);

        // Take first 64 values (8x8) after the first value
        const dctLowFreq = dct.slice(1, 65);

        // Calculate average
        const avg = dctLowFreq.reduce((a, b) => a + b, 0) / dctLowFreq.length;

        // Create fingerprint (hash)
        let hash = '';
        for (const val of dctLowFreq) {
            hash += val > avg ? '1' : '0';
        }

        return hash;
    } catch (error) {
        console.error('Error calculating pHash:', error);
        return null;
    }
}

/**
 * Calculate Hamming distance between two fingerprints
 */
export function hammingDistance(hash1: string, hash2: string): number {
    if (hash1.length !== hash2.length) return 64; // Maximum distance

    let distance = 0;
    for (let i = 0; i < hash1.length; i++) {
        if (hash1[i] !== hash2[i]) distance++;
    }

    return distance;
}

/**
 * Convert Hamming distance to similarity percentage
 */
export function hashSimilarity(hash1: string, hash2: string): number {
    const distance = hammingDistance(hash1, hash2);
    return 1 - distance / 64;
}

// ==================== Color Histogram ====================

/**
 * Calculate Color Histogram for image
 */
async function calculateColorHistogram(imageUrl: string): Promise<number[] | null> {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                resolve(null);
                return;
            }

            // Resize to 64x64 for speed
            canvas.width = 64;
            canvas.height = 64;
            ctx.drawImage(img, 0, 0, 64, 64);

            const imageData = ctx.getImageData(0, 0, 64, 64);
            const { data } = imageData;

            // Histogram for each color channel (8 bins per channel)
            const bins = 8;
            const histR = new Array(bins).fill(0);
            const histG = new Array(bins).fill(0);
            const histB = new Array(bins).fill(0);

            for (let i = 0; i < data.length; i += 4) {
                const binR = Math.floor(data[i] / 32);
                const binG = Math.floor(data[i + 1] / 32);
                const binB = Math.floor(data[i + 2] / 32);

                histR[binR]++;
                histG[binG]++;
                histB[binB]++;
            }

            // Normalize
            const total = 64 * 64;
            const histogram = [
                ...histR.map(v => v / total),
                ...histG.map(v => v / total),
                ...histB.map(v => v / total),
            ];

            resolve(histogram);
        };

        img.onerror = () => resolve(null);
        img.src = imageUrl;
    });
}

/**
 * Calculate Histogram similarity using Cosine Similarity
 */
function histogramSimilarity(hist1: number[], hist2: number[]): number {
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < hist1.length; i++) {
        dotProduct += hist1[i] * hist2[i];
        norm1 += hist1[i] * hist1[i];
        norm2 += hist2[i] * hist2[i];
    }

    if (norm1 === 0 || norm2 === 0) return 0;

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

// ==================== Average Hash (aHash) - Simpler Alternative ====================

/**
 * Calculate aHash (simple and fast)
 */
export async function calculateAHash(imageUrl: string): Promise<string | null> {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                resolve(null);
                return;
            }

            // Resize to 8x8
            canvas.width = 8;
            canvas.height = 8;
            ctx.drawImage(img, 0, 0, 8, 8);

            const imageData = ctx.getImageData(0, 0, 8, 8);
            const { data } = imageData;

            // Convert to grayscale and calculate average
            const gray: number[] = [];
            for (let i = 0; i < data.length; i += 4) {
                gray.push(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
            }

            const avg = gray.reduce((a, b) => a + b, 0) / gray.length;

            // Create fingerprint
            let hash = '';
            for (const val of gray) {
                hash += val > avg ? '1' : '0';
            }

            resolve(hash);
        };

        img.onerror = () => resolve(null);
        img.src = imageUrl;
    });
}

// ==================== Main Image Similarity Function ====================

export interface ImageSimilarityResult {
    overall: number;
    pHashScore: number;
    colorScore: number;
    hasImages: boolean;
}

/**
 * Calculate similarity between two images
 */
export async function calculateImageSimilarity(
    imageUrl1: string,
    imageUrl2: string
): Promise<ImageSimilarityResult> {
    if (!imageUrl1 || !imageUrl2) {
        return { overall: 0, pHashScore: 0, colorScore: 0, hasImages: false };
    }

    try {
        // Calculate pHash for both images (using aHash as it's faster)
        const [hash1, hash2, hist1, hist2] = await Promise.all([
            calculateAHash(imageUrl1),
            calculateAHash(imageUrl2),
            calculateColorHistogram(imageUrl1),
            calculateColorHistogram(imageUrl2),
        ]);

        // Calculate pHash similarity
        let pHashScore = 0;
        if (hash1 && hash2) {
            pHashScore = hashSimilarity(hash1, hash2);
        }

        // Calculate color similarity
        let colorScore = 0;
        if (hist1 && hist2) {
            colorScore = histogramSimilarity(hist1, hist2);
        }

        // Overall score
        const overall = pHashScore * 0.6 + colorScore * 0.4;

        return {
            overall: Math.round(overall * 100) / 100,
            pHashScore: Math.round(pHashScore * 100) / 100,
            colorScore: Math.round(colorScore * 100) / 100,
            hasImages: true,
        };
    } catch (error) {
        console.error('Error calculating image similarity:', error);
        return { overall: 0, pHashScore: 0, colorScore: 0, hasImages: false };
    }
}

/**
 * Compare image sets
 */
export async function compareImageSets(
    images1: string[],
    images2: string[]
): Promise<number> {
    if (!images1.length || !images2.length) return 0;

    let maxScore = 0;

    // Compare each image from first set with each image from second set
    for (const img1 of images1.slice(0, 3)) { // Only first 3 images for speed
        for (const img2 of images2.slice(0, 3)) {
            const result = await calculateImageSimilarity(img1, img2);
            maxScore = Math.max(maxScore, result.overall);
        }
    }

    return maxScore;
}