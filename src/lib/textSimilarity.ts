/**
 * Advanced Text Similarity Algorithm
 * Uses TF-IDF + Jaccard Similarity + Text Stemming
 */

// ==================== English Text Processing ====================

// Common English stop words
const ENGLISH_STOP_WORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these',
    'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which',
    'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both',
    'few', 'more', 'most', 'other', 'some', 'such', 'no', 'not', 'only',
    'own', 'same', 'so', 'than', 'too', 'very', 'just', 'about', 'into',
    'through', 'during', 'before', 'after', 'above', 'below', 'between',
    'under', 'again', 'further', 'then', 'once',
]);

// Common English suffixes for basic stemming
const ENGLISH_SUFFIXES = ['ing', 'ed', 'es', 's', 'ly', 'er', 'est', 'tion', 'ness', 'ment'];

/**
 * Clean English text
 */
function cleanText(text: string): string {
    return text
        // Remove numbers
        .replace(/[0-9]/g, '')
        // Remove punctuation
        .replace(/[.,;:?!'"()-]/g, ' ')
        // Convert to lowercase
        .toLowerCase()
        // Remove extra whitespace
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Basic English word stemming (Light Stemming)
 */
function stemWord(word: string): string {
    if (word.length < 4) return word;

    let stemmed = word;

    // Remove common suffixes
    for (const suffix of ENGLISH_SUFFIXES) {
        if (stemmed.endsWith(suffix) && stemmed.length > suffix.length + 2) {
            stemmed = stemmed.slice(0, -suffix.length);
            break;
        }
    }

    return stemmed;
}

/**
 * Tokenize text into processed words
 */
function tokenize(text: string): string[] {
    const cleaned = cleanText(text);
    const words = cleaned.split(/\s+/).filter(w => w.length > 1);

    return words
        .filter(word => !ENGLISH_STOP_WORDS.has(word))
        .map(word => stemWord(word))
        .filter(word => word.length > 1);
}

// ==================== TF-IDF Implementation ====================

/**
 * Calculate Term Frequency
 */
function calculateTF(tokens: string[]): Map<string, number> {
    const tf = new Map<string, number>();
    const total = tokens.length;

    for (const token of tokens) {
        tf.set(token, (tf.get(token) || 0) + 1);
    }

    // Normalize values
    for (const [token, count] of tf) {
        tf.set(token, count / total);
    }

    return tf;
}

/**
 * Calculate TF-IDF Vector
 */
function calculateTFIDF(tokens1: string[], tokens2: string[]): { vec1: Map<string, number>; vec2: Map<string, number> } {
    const tf1 = calculateTF(tokens1);
    const tf2 = calculateTF(tokens2);

    // Collect all tokens
    const allTokens = new Set([...tokens1, ...tokens2]);

    const vec1 = new Map<string, number>();
    const vec2 = new Map<string, number>();

    for (const token of allTokens) {
        // Simple IDF (in two documents)
        const df = (tokens1.includes(token) ? 1 : 0) + (tokens2.includes(token) ? 1 : 0);
        const idf = Math.log(2 / df) + 1;

        vec1.set(token, (tf1.get(token) || 0) * idf);
        vec2.set(token, (tf2.get(token) || 0) * idf);
    }

    return { vec1, vec2 };
}

/**
 * Calculate Cosine Similarity
 */
function cosineSimilarity(vec1: Map<string, number>, vec2: Map<string, number>): number {
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    const allKeys = new Set([...vec1.keys(), ...vec2.keys()]);

    for (const key of allKeys) {
        const v1 = vec1.get(key) || 0;
        const v2 = vec2.get(key) || 0;

        dotProduct += v1 * v2;
        norm1 += v1 * v1;
        norm2 += v2 * v2;
    }

    if (norm1 === 0 || norm2 === 0) return 0;

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

// ==================== Jaccard Similarity ====================

/**
 * Calculate Jaccard Similarity
 */
function jaccardSimilarity(tokens1: string[], tokens2: string[]): number {
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    if (union.size === 0) return 0;

    return intersection.size / union.size;
}

// ==================== N-gram Similarity ====================

/**
 * Create N-grams
 */
function createNGrams(text: string, n: number): Set<string> {
    const ngrams = new Set<string>();
    const cleaned = cleanText(text);

    for (let i = 0; i <= cleaned.length - n; i++) {
        ngrams.add(cleaned.slice(i, i + n));
    }

    return ngrams;
}

/**
 * Calculate N-gram similarity
 */
function ngramSimilarity(text1: string, text2: string, n = 2): number {
    const ngrams1 = createNGrams(text1, n);
    const ngrams2 = createNGrams(text2, n);

    const intersection = new Set([...ngrams1].filter(x => ngrams2.has(x)));
    const union = new Set([...ngrams1, ...ngrams2]);

    if (union.size === 0) return 0;

    return intersection.size / union.size;
}

// ==================== Main Text Similarity Function ====================

export interface TextSimilarityResult {
    overall: number;
    tfidf: number;
    jaccard: number;
    ngram: number;
    exactMatch: boolean;
}

/**
 * Calculate comprehensive text similarity
 * Combines TF-IDF, Jaccard, and N-gram
 */
export function calculateTextSimilarity(text1: string, text2: string): TextSimilarityResult {
    // Check for empty values
    if (!text1 || !text2) {
        return { overall: 0, tfidf: 0, jaccard: 0, ngram: 0, exactMatch: false };
    }

    // Check for exact match
    if (cleanText(text1) === cleanText(text2)) {
        return { overall: 1, tfidf: 1, jaccard: 1, ngram: 1, exactMatch: true };
    }

    // Tokenization
    const tokens1 = tokenize(text1);
    const tokens2 = tokenize(text2);

    // TF-IDF + Cosine Similarity
    const { vec1, vec2 } = calculateTFIDF(tokens1, tokens2);
    const tfidf = cosineSimilarity(vec1, vec2);

    // Jaccard Similarity
    const jaccard = jaccardSimilarity(tokens1, tokens2);

    // N-gram Similarity (bigrams)
    const ngram = ngramSimilarity(text1, text2, 2);

    // Overall score (Weighted Average)
    const overall = tfidf * 0.5 + jaccard * 0.3 + ngram * 0.2;

    return {
        overall: Math.round(overall * 100) / 100,
        tfidf: Math.round(tfidf * 100) / 100,
        jaccard: Math.round(jaccard * 100) / 100,
        ngram: Math.round(ngram * 100) / 100,
        exactMatch: false,
    };
}

/**
 * Compare multiple attributes
 */
export function compareAttributes(
    item1: { title: string; description: string; color?: string; marks?: string; category: string },
    item2: { title: string; description: string; color?: string; marks?: string; category: string }
): number {
    // Title similarity (weight 30%)
    const titleSim = calculateTextSimilarity(item1.title, item2.title).overall;

    // Description similarity (weight 40%)
    const descSim = calculateTextSimilarity(item1.description, item2.description).overall;

    // Color similarity (weight 15%)
    let colorSim = 0;
    if (item1.color && item2.color) {
        colorSim = calculateTextSimilarity(item1.color, item2.color).overall;
    }

    // Distinguishing marks similarity (weight 10%)
    let marksSim = 0;
    if (item1.marks && item2.marks) {
        marksSim = calculateTextSimilarity(item1.marks, item2.marks).overall;
    }

    // Category match (weight 5%)
    const categorySim = item1.category === item2.category ? 1 : 0;

    const total =
        titleSim * 0.30 +
        descSim * 0.40 +
        colorSim * 0.15 +
        marksSim * 0.10 +
        categorySim * 0.05;

    return Math.round(total * 100) / 100;
}