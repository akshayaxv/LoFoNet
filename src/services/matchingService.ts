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
    // Algorithm weights (updated)
    TEXT_WEIGHT: 0.35,      // Weight for text, description, and distinguishing marks similarity
    LOCATION_WEIGHT: 0.25,  // Weight for location similarity (GPS + city)
    TIME_WEIGHT: 0.15,      // Weight for date proximity
    IMAGE_WEIGHT: 0.25,     // Weight for image similarity

    // Thresholds
    MIN_THRESHOLD: 0.40,    // Minimum threshold for matching
    HIGH_THRESHOLD: 0.70,   // High match threshold

    // Settings
    MAX_DATE_DIFF_DAYS: 45, // Maximum difference in days
    MAX_DISTANCE_KM: 50,    // Maximum distance in kilometers for high match
};

// ==================== Location Similarity with GPS ====================

/**
 * Calculate distance between two points using Haversine formula
 * @returns Distance in kilometers
 */
function calculateHaversineDistance(
    lat1: number, lng1: number,
    lat2: number, lng2: number
): number {
    const R = 6371; // Earth's radius in kilometers

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
 * Calculate location similarity (with GPS support)
 */
function calculateLocationSimilarity(
    city1?: string, city2?: string,
    address1?: string, address2?: string,
    lat1?: number, lng1?: number,
    lat2?: number, lng2?: number
): number {
    // If GPS coordinates are available
    if (lat1 && lng1 && lat2 && lng2) {
        const distance = calculateHaversineDistance(lat1, lng1, lat2, lng2);

        if (distance <= 1) return 1.0;      // Less than 1 km = perfect match
        if (distance <= 5) return 0.9;      // Less than 5 km = very high match
        if (distance <= 10) return 0.8;     // Less than 10 km = high match
        if (distance <= 20) return 0.6;     // Less than 20 km = medium match
        if (distance <= MATCH_SETTINGS.MAX_DISTANCE_KM) return 0.4; // Less than 50 km

        // More than 50 km = low match
        return Math.max(0.1, 1 - (distance / 200));
    }

    // If GPS is not available, rely on city and address
    if (!city1 || !city2) return 0;

    // Perfect match for city
    if (city1 === city2) {
        // If there are addresses, compare them as well
        if (address1 && address2) {
            const addressSim = calculateTextSimilarity(address1, address2).overall;
            return 0.7 + (addressSim * 0.3); // 70% for city + 30% for address
        }
        return 0.7; // Same city without address
    }

    return 0.1; // Different cities
}

/**
 * Calculate date similarity
 */
function calculateTimeSimilarity(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    const diffDays = Math.abs(d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays > MATCH_SETTINGS.MAX_DATE_DIFF_DAYS) return 0;

    // Bonus for very close dates
    if (diffDays <= 1) return 1.0;      // Same day or one day
    if (diffDays <= 3) return 0.95;     // 3 days
    if (diffDays <= 7) return 0.85;     // One week
    if (diffDays <= 14) return 0.7;     // Two weeks

    // The smaller the difference, the higher the score
    return Math.max(0.2, 1 - (diffDays / MATCH_SETTINGS.MAX_DATE_DIFF_DAYS));
}

// ==================== Main Matching Functions ====================

/**
 * Search for potential matches for a given report
 */
export async function findPotentialMatches(reportId: string): Promise<AIMatch[]> {
    try {
        console.log('🔍 Starting search for matches for report:', reportId);

        // Fetch the original report
        const reports = await sql`
      SELECT r.*, 
        ARRAY(SELECT image_url FROM report_images WHERE report_id = r.id) as images
      FROM reports r 
      WHERE r.id = ${reportId}
    `;

        if (reports.length === 0) {
            console.log('❌ Report not found');
            return [];
        }

        const report = reports[0] as Report;
        const oppositeType = report.type === 'lost' ? 'found' : 'lost';

        // Fetch opposite reports from the same category
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

        console.log(`📋 Found ${candidates.length} candidate reports for comparison`);

        const matches: AIMatch[] = [];

        for (const candidate of candidates) {
            // 1. Calculate text similarity
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

            // 2. Calculate image similarity (if found)
            let imageScore = 0;
            if (report.images?.length && candidate.images?.length) {
                imageScore = await compareImageSets(report.images, candidate.images);
            }

            // 3. Calculate location similarity (with GPS)
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

            // 4. Calculate date similarity
            const timeScore = calculateTimeSimilarity(
                report.date_occurred,
                candidate.date_occurred
            );

            // 5. Calculate final score
            const finalScore =
                textScore * MATCH_SETTINGS.TEXT_WEIGHT +
                imageScore * MATCH_SETTINGS.IMAGE_WEIGHT +
                locationScore * MATCH_SETTINGS.LOCATION_WEIGHT +
                timeScore * MATCH_SETTINGS.TIME_WEIGHT;

            console.log(`📊 Comparison with ${candidate.title}:`, {
                text: textScore.toFixed(2),
                image: imageScore.toFixed(2),
                location: locationScore.toFixed(2),
                time: timeScore.toFixed(2),
                final: finalScore.toFixed(2),
            });

            // Add match if it exceeds threshold
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

        // Sort by final score
        matches.sort((a, b) => b.final_score - a.final_score);

        console.log(`✅ Found ${matches.length} potential matches`);
        return matches;
    } catch (error) {
        console.error('❌ Error searching for matches:', error);
        return [];
    }
}

/**
 * Save new match to database and send notification to admin
 */
export async function saveMatch(match: Omit<AIMatch, 'id' | 'created_at' | 'updated_at'>): Promise<AIMatch | null> {
    try {
        // Check for existing match
        const existing = await sql`
      SELECT id FROM ai_matches 
      WHERE lost_report_id = ${match.lost_report_id} 
      AND found_report_id = ${match.found_report_id}
    `;

        if (existing.length > 0) {
            console.log('⚠️ Match already exists');
            return null;
        }

        // Save match
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

        // Fetch report information to send notification
        const lostReport = await sql`SELECT title FROM reports WHERE id = ${match.lost_report_id}`;
        const foundReport = await sql`SELECT title FROM reports WHERE id = ${match.found_report_id}`;

        // Send notification to admins
        await notifyAdminsOfMatch(
            savedMatch.id,
            lostReport[0]?.title || 'Lost report',
            foundReport[0]?.title || 'Found report',
            match.final_score
        );

        console.log('✅ Match saved and notification sent to admins');
        return savedMatch;
    } catch (error) {
        console.error('❌ Error saving match:', error);
        return null;
    }
}

/**
 * Get all matches with report details
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

        // Fetch images for each report
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
        console.error('Error fetching matches:', error);
        return [];
    }
}

/**
 * Confirm match and send notification to user
 */
export async function confirmMatch(matchId: string): Promise<boolean> {
    try {
        // Fetch match information
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

        // Update match status
        await sql`
      UPDATE ai_matches 
      SET status = 'confirmed', updated_at = NOW()
      WHERE id = ${matchId}
    `;

        // Update report statuses
        await sql`
      UPDATE reports SET status = 'matched', updated_at = NOW()
      WHERE id = ${match.lost_report_id} OR id = ${match.found_report_id}
    `;

        // Send notification to lost report owner
        await notifyUserOfConfirmedMatch(
            match.lost_user_id,
            match.lost_title,
            match.found_title
        );

        // Send notification to found report owner
        await notifyUserOfConfirmedMatch(
            match.found_user_id,
            match.found_title,
            match.lost_title
        );

        console.log('✅ Match confirmed and notifications sent');
        return true;
    } catch (error) {
        console.error('❌ Error confirming match:', error);
        return false;
    }
}

/**
 * Reject match
 */
export async function rejectMatch(matchId: string): Promise<boolean> {
    try {
        await sql`
      UPDATE ai_matches 
      SET status = 'rejected', updated_at = NOW()
      WHERE id = ${matchId}
    `;
        console.log('✅ Match rejected');
        return true;
    } catch (error) {
        console.error('❌ Error rejecting match:', error);
        return false;
    }
}

/**
 * Run automatic matching process for a new report
 */
export async function runAutoMatchForReport(reportId: string): Promise<number> {
    try {
        console.log('🚀 Starting automatic matching for report:', reportId);

        // Search for matches
        const matches = await findPotentialMatches(reportId);

        let savedCount = 0;

        // Save matches and send notifications
        for (const match of matches) {
            const saved = await saveMatch(match);
            if (saved) savedCount++;
        }

        // Update report status only without notifying the user
        // (User will only receive notification when match is confirmed by admin)
        if (savedCount > 0) {
            await sql`
        UPDATE reports SET status = 'processing', updated_at = NOW()
        WHERE id = ${reportId}
      `;
        }

        console.log(`✅ Found ${savedCount} new matches`);
        return savedCount;
    } catch (error) {
        console.error('❌ Error in automatic matching:', error);
        return 0;
    }
}