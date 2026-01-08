import { sql } from '@/lib/db';
import { calculateTextSimilarity, compareAttributes } from '@/lib/textSimilarity';
import { compareImageSets } from '@/lib/imageSimilarity';
import {
    notifyAdminsOfMatch,
    notifyUserOfConfirmedMatch,
    notifyUserOfStatusChange
} from './notificationService';

// ==================== Types ====================

export interface Report {
    id: string;
    user_id: string;
    type: 'lost' | 'found';
    title: string;
    description: string;
    category: string;
    color?: string;
    distinguishing_marks?: string;
    date_occurred: string;
    location_address?: string;
    location_city?: string;
    location_lat?: number;
    location_lng?: number;
    status: string;
    images?: string[];
    user_name?: string;
    user_email?: string;
}

export interface AIMatch {
    id: string;
    lost_report_id: string;
    found_report_id: string;
    image_score: number;
    text_score: number;
    location_score: number;
    final_score: number;
    status: 'pending' | 'confirmed' | 'rejected';
    created_at: string;
    updated_at: string;
    // Joined data
    lost_report?: Report;
    found_report?: Report;
}

// ==================== Matching Algorithm Settings ====================

const MATCH_SETTINGS = {
    // أوزان الخوارزمية (المُحدثة)
    TEXT_WEIGHT: 0.35,      // وزن تشابه النص والوصف والعلامات المميزة
    LOCATION_WEIGHT: 0.25,  // وزن تشابه الموقع (GPS + المدينة)
    TIME_WEIGHT: 0.15,      // وزن قرب التاريخ
    IMAGE_WEIGHT: 0.25,     // وزن تشابه الصور

    // العتبات
    MIN_THRESHOLD: 0.40,    // الحد الأدنى للتطابق
    HIGH_THRESHOLD: 0.70,   // تطابق عالي

    // إعدادات
    MAX_DATE_DIFF_DAYS: 45, // أقصى فرق بالأيام
    MAX_DISTANCE_KM: 50,    // أقصى مسافة بالكيلومتر للتطابق العالي
};

// ==================== Location Similarity with GPS ====================

/**
 * حساب المسافة بين نقطتين باستخدام Haversine formula
 * @returns المسافة بالكيلومتر
 */
function calculateHaversineDistance(
    lat1: number, lng1: number,
    lat2: number, lng2: number
): number {
    const R = 6371; // نصف قطر الأرض بالكيلومتر

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

/**
 * حساب تشابه الموقع (مع دعم GPS)
 */
function calculateLocationSimilarity(
    city1?: string, city2?: string,
    address1?: string, address2?: string,
    lat1?: number, lng1?: number,
    lat2?: number, lng2?: number
): number {
    // إذا توفرت إحداثيات GPS
    if (lat1 && lng1 && lat2 && lng2) {
        const distance = calculateHaversineDistance(lat1, lng1, lat2, lng2);

        if (distance <= 1) return 1.0;      // أقل من 1 كم = تطابق تام
        if (distance <= 5) return 0.9;      // أقل من 5 كم = تطابق عالي جداً
        if (distance <= 10) return 0.8;     // أقل من 10 كم = تطابق عالي
        if (distance <= 20) return 0.6;     // أقل من 20 كم = تطابق متوسط
        if (distance <= MATCH_SETTINGS.MAX_DISTANCE_KM) return 0.4; // أقل من 50 كم

        // أكثر من 50 كم = تطابق منخفض
        return Math.max(0.1, 1 - (distance / 200));
    }

    // إذا لم تتوفر GPS، نعتمد على المدينة والعنوان
    if (!city1 || !city2) return 0;

    // تطابق تام للمدينة
    if (city1 === city2) {
        // إذا كان هناك عناوين، نقارنها أيضاً
        if (address1 && address2) {
            const addressSim = calculateTextSimilarity(address1, address2).overall;
            return 0.7 + (addressSim * 0.3); // 70% للمدينة + 30% للعنوان
        }
        return 0.7; // نفس المدينة بدون عنوان
    }

    return 0.1; // مدن مختلفة
}

/**
 * حساب تشابه التاريخ
 */
function calculateTimeSimilarity(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    const diffDays = Math.abs(d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays > MATCH_SETTINGS.MAX_DATE_DIFF_DAYS) return 0;

    // مكافأة للتواريخ القريبة جداً
    if (diffDays <= 1) return 1.0;      // نفس اليوم أو يوم واحد
    if (diffDays <= 3) return 0.95;     // 3 أيام
    if (diffDays <= 7) return 0.85;     // أسبوع
    if (diffDays <= 14) return 0.7;     // أسبوعين

    // كلما كان الفرق أقل، كانت النتيجة أعلى
    return Math.max(0.2, 1 - (diffDays / MATCH_SETTINGS.MAX_DATE_DIFF_DAYS));
}

// ==================== Main Matching Functions ====================

/**
 * البحث عن تطابقات محتملة لبلاغ معين
 */
export async function findPotentialMatches(reportId: string): Promise<AIMatch[]> {
    try {
        console.log('🔍 بدء البحث عن تطابقات للبلاغ:', reportId);

        // جلب البلاغ الأصلي
        const reports = await sql`
      SELECT r.*, 
        ARRAY(SELECT image_url FROM report_images WHERE report_id = r.id) as images
      FROM reports r 
      WHERE r.id = ${reportId}
    `;

        if (reports.length === 0) {
            console.log('❌ البلاغ غير موجود');
            return [];
        }

        const report = reports[0] as Report;
        const oppositeType = report.type === 'lost' ? 'found' : 'lost';

        // جلب البلاغات المقابلة من نفس الفئة
        const candidates = await sql`
      SELECT r.*, 
        ARRAY(SELECT image_url FROM report_images WHERE report_id = r.id) as images
      FROM reports r 
      WHERE r.type = ${oppositeType} 
      AND r.category = ${report.category}
      AND r.status NOT IN ('closed', 'matched')
      ORDER BY r.created_at DESC
      LIMIT 50
    `;

        console.log(`📋 تم العثور على ${candidates.length} بلاغ مرشح للمقارنة`);

        const matches: AIMatch[] = [];

        for (const candidate of candidates) {
            // 1. حساب تشابه النص
            const textScore = compareAttributes(
                {
                    title: report.title,
                    description: report.description,
                    color: report.color,
                    marks: report.distinguishing_marks,
                    category: report.category,
                },
                {
                    title: candidate.title,
                    description: candidate.description,
                    color: candidate.color,
                    marks: candidate.distinguishing_marks,
                    category: candidate.category,
                }
            );

            // 2. حساب تشابه الصور (إذا وجدت)
            let imageScore = 0;
            if (report.images?.length && candidate.images?.length) {
                imageScore = await compareImageSets(report.images, candidate.images);
            }

            // 3. حساب تشابه الموقع (مع GPS)
            const locationScore = calculateLocationSimilarity(
                report.location_city,
                candidate.location_city,
                report.location_address,
                candidate.location_address,
                report.location_lat,
                report.location_lng,
                candidate.location_lat,
                candidate.location_lng
            );

            // 4. حساب تشابه التاريخ
            const timeScore = calculateTimeSimilarity(
                report.date_occurred,
                candidate.date_occurred
            );

            // 5. حساب الدرجة النهائية
            const finalScore =
                textScore * MATCH_SETTINGS.TEXT_WEIGHT +
                imageScore * MATCH_SETTINGS.IMAGE_WEIGHT +
                locationScore * MATCH_SETTINGS.LOCATION_WEIGHT +
                timeScore * MATCH_SETTINGS.TIME_WEIGHT;

            console.log(`📊 مقارنة مع ${candidate.title}:`, {
                text: textScore.toFixed(2),
                image: imageScore.toFixed(2),
                location: locationScore.toFixed(2),
                time: timeScore.toFixed(2),
                final: finalScore.toFixed(2),
            });

            // إضافة التطابق إذا تجاوز العتبة
            if (finalScore >= MATCH_SETTINGS.MIN_THRESHOLD) {
                const match: AIMatch = {
                    id: crypto.randomUUID(),
                    lost_report_id: report.type === 'lost' ? report.id : candidate.id,
                    found_report_id: report.type === 'found' ? report.id : candidate.id,
                    image_score: Math.round(imageScore * 100) / 100,
                    text_score: Math.round(textScore * 100) / 100,
                    location_score: Math.round(locationScore * 100) / 100,
                    final_score: Math.round(finalScore * 100) / 100,
                    status: 'pending',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                };
                matches.push(match);
            }
        }

        // ترتيب حسب الدرجة النهائية
        matches.sort((a, b) => b.final_score - a.final_score);

        console.log(`✅ تم العثور على ${matches.length} تطابق محتمل`);
        return matches;
    } catch (error) {
        console.error('❌ خطأ في البحث عن التطابقات:', error);
        return [];
    }
}

/**
 * حفظ تطابق جديد في قاعدة البيانات وإرسال إشعار للأدمن
 */
export async function saveMatch(match: Omit<AIMatch, 'id' | 'created_at' | 'updated_at'>): Promise<AIMatch | null> {
    try {
        // التحقق من عدم وجود تطابق سابق
        const existing = await sql`
      SELECT id FROM ai_matches 
      WHERE lost_report_id = ${match.lost_report_id} 
      AND found_report_id = ${match.found_report_id}
    `;

        if (existing.length > 0) {
            console.log('⚠️ التطابق موجود مسبقاً');
            return null;
        }

        // حفظ التطابق
        const result = await sql`
      INSERT INTO ai_matches (
        lost_report_id, found_report_id, 
        image_score, text_score, location_score, final_score, status
      )
      VALUES (
        ${match.lost_report_id}, ${match.found_report_id},
        ${match.image_score}, ${match.text_score}, 
        ${match.location_score}, ${match.final_score}, ${match.status}
      )
      RETURNING *
    `;

        const savedMatch = result[0] as AIMatch;

        // جلب معلومات البلاغات لإرسال الإشعار
        const lostReport = await sql`SELECT title FROM reports WHERE id = ${match.lost_report_id}`;
        const foundReport = await sql`SELECT title FROM reports WHERE id = ${match.found_report_id}`;

        // إرسال إشعار للمديرين
        await notifyAdminsOfMatch(
            savedMatch.id,
            lostReport[0]?.title || 'بلاغ مفقود',
            foundReport[0]?.title || 'بلاغ موجود',
            match.final_score
        );

        console.log('✅ تم حفظ التطابق وإرسال إشعار للمديرين');
        return savedMatch;
    } catch (error) {
        console.error('❌ خطأ في حفظ التطابق:', error);
        return null;
    }
}

/**
 * جلب جميع التطابقات مع تفاصيل البلاغات
 */
export async function getMatchesWithDetails(status?: string): Promise<AIMatch[]> {
    try {
        let matches;

        if (status) {
            matches = await sql`
        SELECT m.*,
          lr.title as lost_title, lr.description as lost_description, 
          lr.category as lost_category, lr.location_city as lost_city,
          lr.user_id as lost_user_id,
          fr.title as found_title, fr.description as found_description,
          fr.category as found_category, fr.location_city as found_city,
          fr.user_id as found_user_id
        FROM ai_matches m
        LEFT JOIN reports lr ON m.lost_report_id = lr.id
        LEFT JOIN reports fr ON m.found_report_id = fr.id
        WHERE m.status = ${status}
        ORDER BY m.final_score DESC, m.created_at DESC
      `;
        } else {
            matches = await sql`
        SELECT m.*,
          lr.title as lost_title, lr.description as lost_description,
          lr.category as lost_category, lr.location_city as lost_city,
          lr.user_id as lost_user_id,
          fr.title as found_title, fr.description as found_description,
          fr.category as found_category, fr.location_city as found_city,
          fr.user_id as found_user_id
        FROM ai_matches m
        LEFT JOIN reports lr ON m.lost_report_id = lr.id
        LEFT JOIN reports fr ON m.found_report_id = fr.id
        ORDER BY m.final_score DESC, m.created_at DESC
      `;
        }

        // جلب صور كل بلاغ
        for (const match of matches) {
            const lostImages = await sql`
        SELECT image_url FROM report_images WHERE report_id = ${match.lost_report_id}
      `;
            const foundImages = await sql`
        SELECT image_url FROM report_images WHERE report_id = ${match.found_report_id}
      `;

            match.lost_report = {
                id: match.lost_report_id,
                title: match.lost_title,
                description: match.lost_description,
                category: match.lost_category,
                location_city: match.lost_city,
                user_id: match.lost_user_id,
                images: lostImages.map((i: { image_url: string }) => i.image_url),
            };

            match.found_report = {
                id: match.found_report_id,
                title: match.found_title,
                description: match.found_description,
                category: match.found_category,
                location_city: match.found_city,
                user_id: match.found_user_id,
                images: foundImages.map((i: { image_url: string }) => i.image_url),
            };
        }

        return matches as AIMatch[];
    } catch (error) {
        console.error('خطأ في جلب التطابقات:', error);
        return [];
    }
}

/**
 * تأكيد التطابق وإرسال إشعار للمستخدم
 */
export async function confirmMatch(matchId: string): Promise<boolean> {
    try {
        // جلب معلومات التطابق
        const matchData = await sql`
      SELECT m.*, 
        lr.title as lost_title, lr.user_id as lost_user_id,
        fr.title as found_title, fr.user_id as found_user_id
      FROM ai_matches m
      LEFT JOIN reports lr ON m.lost_report_id = lr.id
      LEFT JOIN reports fr ON m.found_report_id = fr.id
      WHERE m.id = ${matchId}
    `;

        if (matchData.length === 0) return false;

        const match = matchData[0];

        // تحديث حالة التطابق
        await sql`
      UPDATE ai_matches 
      SET status = 'confirmed', updated_at = NOW()
      WHERE id = ${matchId}
    `;

        // تحديث حالة البلاغات
        await sql`
      UPDATE reports SET status = 'matched', updated_at = NOW()
      WHERE id = ${match.lost_report_id} OR id = ${match.found_report_id}
    `;

        // إرسال إشعار لصاحب بلاغ المفقود
        await notifyUserOfConfirmedMatch(
            match.lost_user_id,
            match.lost_title,
            match.found_title
        );

        // إرسال إشعار لصاحب بلاغ الموجود
        await notifyUserOfConfirmedMatch(
            match.found_user_id,
            match.found_title,
            match.lost_title
        );

        console.log('✅ تم تأكيد التطابق وإرسال الإشعارات');
        return true;
    } catch (error) {
        console.error('❌ خطأ في تأكيد التطابق:', error);
        return false;
    }
}

/**
 * رفض التطابق
 */
export async function rejectMatch(matchId: string): Promise<boolean> {
    try {
        await sql`
      UPDATE ai_matches 
      SET status = 'rejected', updated_at = NOW()
      WHERE id = ${matchId}
    `;
        console.log('✅ تم رفض التطابق');
        return true;
    } catch (error) {
        console.error('❌ خطأ في رفض التطابق:', error);
        return false;
    }
}

/**
 * تشغيل عملية التطابق التلقائي لبلاغ جديد
 */
export async function runAutoMatchForReport(reportId: string): Promise<number> {
    try {
        console.log('🚀 بدء التطابق التلقائي للبلاغ:', reportId);

        // البحث عن التطابقات
        const matches = await findPotentialMatches(reportId);

        let savedCount = 0;

        // حفظ التطابقات وإرسال الإشعارات
        for (const match of matches) {
            const saved = await saveMatch(match);
            if (saved) savedCount++;
        }

        // تحديث حالة البلاغ فقط بدون إشعار المستخدم
        // (المستخدم سيتلقى إشعار فقط عند تأكيد التطابق من قبل الأدمن)
        if (savedCount > 0) {
            await sql`
        UPDATE reports SET status = 'processing', updated_at = NOW()
        WHERE id = ${reportId}
      `;
        }

        console.log(`✅ تم العثور على ${savedCount} تطابق جديد`);
        return savedCount;
    } catch (error) {
        console.error('❌ خطأ في التطابق التلقائي:', error);
        return 0;
    }
}
