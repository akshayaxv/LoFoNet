import { sql } from '@/lib/db';
import { uploadMultipleImages } from './imageService';
import { runAutoMatchForReport } from './matchingService';

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
    status: 'pending' | 'processing' | 'matched' | 'contacted' | 'closed';
    created_at: string;
    updated_at: string;
    images?: string[];
    user_name?: string;
    user_email?: string;
}

export interface CreateReportData {
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
}

export interface ReportFilters {
    type?: 'lost' | 'found';
    status?: string;
    category?: string;
    city?: string;
    userId?: string;
    search?: string;
    limit?: number;
    offset?: number;
}

/**
 * Create new report with automatic matching
 */
export async function createReport(data: CreateReportData, imageFiles?: File[]): Promise<{ success: boolean; report?: Report; matchesFound?: number; error?: string }> {
    try {
        console.log('📝 Creating new report...');

        // Create report
        const reports = await sql`
      INSERT INTO reports (
        user_id, type, title, description, category, color,
        distinguishing_marks, date_occurred, location_address,
        location_city, location_lat, location_lng
      )
      VALUES (
        ${data.user_id}, ${data.type}, ${data.title}, ${data.description},
        ${data.category}, ${data.color || null}, ${data.distinguishing_marks || null},
        ${data.date_occurred}, ${data.location_address || null},
        ${data.location_city || null}, ${data.location_lat || null}, ${data.location_lng || null}
      )
      RETURNING *
    `;

        const report = reports[0] as Report;
        console.log('✅ Report created:', report.id);

        // Upload images if found
        if (imageFiles && imageFiles.length > 0) {
            console.log('📷 Uploading images...');
            const uploadResult = await uploadMultipleImages(imageFiles);

            for (const url of uploadResult.urls) {
                await sql`
          INSERT INTO report_images (report_id, image_url)
          VALUES (${report.id}, ${url})
        `;
            }

            report.images = uploadResult.urls;
            console.log(`✅ ${uploadResult.urls.length} images uploaded`);
        }

        // 🔍 Run smart matching algorithm automatically
        console.log('🧠 Running smart matching algorithm...');
        const matchesFound = await runAutoMatchForReport(report.id);
        console.log(`✅ Found ${matchesFound} potential matches`);

        return { success: true, report, matchesFound };
    } catch (error) {
        console.error('❌ Error creating report:', error);
        return {
            success: false,
            error: 'An error occurred while creating the report',
        };
    }
}

/**
 * Fetch reports with filtering
 */
export async function getReports(filters: ReportFilters = {}): Promise<Report[]> {
    try {
        console.log('🔄 Fetching reports from database...');

        let reports;

        // If there's a user filter
        if (filters.userId) {
            reports = await sql`
                SELECT r.*, u.name as user_name, u.email as user_email
                FROM reports r
                LEFT JOIN users u ON r.user_id = u.id
                WHERE r.user_id = ${filters.userId}
                ORDER BY r.created_at DESC
                LIMIT ${filters.limit || 50}
            `;
        }
        // If there's a type filter
        else if (filters.type) {
            reports = await sql`
                SELECT r.*, u.name as user_name, u.email as user_email
                FROM reports r
                LEFT JOIN users u ON r.user_id = u.id
                WHERE r.type = ${filters.type}
                ORDER BY r.created_at DESC
                LIMIT ${filters.limit || 50}
            `;
        }
        // If there's a status filter
        else if (filters.status) {
            reports = await sql`
                SELECT r.*, u.name as user_name, u.email as user_email
                FROM reports r
                LEFT JOIN users u ON r.user_id = u.id
                WHERE r.status = ${filters.status}
                ORDER BY r.created_at DESC
                LIMIT ${filters.limit || 50}
            `;
        }
        // No filtering - fetch all
        else {
            reports = await sql`
                SELECT r.*, u.name as user_name, u.email as user_email
                FROM reports r
                LEFT JOIN users u ON r.user_id = u.id
                ORDER BY r.created_at DESC
                LIMIT ${filters.limit || 50}
            `;
        }

        console.log(`✅ Fetched ${reports.length} reports`);

        // Fetch images for each report
        for (const report of reports) {
            const images = await sql`
                SELECT image_url FROM report_images WHERE report_id = ${report.id}
            `;
            report.images = images.map((img: { image_url: string }) => img.image_url);
        }

        return reports as Report[];
    } catch (error) {
        console.error('❌ Error fetching reports:', error);
        return [];
    }
}

/**
 * Fetch single report with details
 */
export async function getReportById(id: string): Promise<Report | null> {
    try {
        const reports = await sql`
      SELECT r.*, u.name as user_name, u.email as user_email
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.id = ${id}
    `;

        if (reports.length === 0) return null;

        const report = reports[0] as Report;

        // Fetch images
        const images = await sql`
      SELECT image_url FROM report_images WHERE report_id = ${id}
    `;
        report.images = images.map((img: { image_url: string }) => img.image_url);

        return report;
    } catch (error) {
        console.error('Error fetching report:', error);
        return null;
    }
}

/**
 * Update report status
 */
export async function updateReportStatus(id: string, status: string): Promise<boolean> {
    try {
        await sql`
      UPDATE reports SET status = ${status}, updated_at = NOW()
      WHERE id = ${id}
    `;
        return true;
    } catch (error) {
        console.error('Error updating report status:', error);
        return false;
    }
}

/**
 * Delete report
 */
export async function deleteReport(id: string): Promise<boolean> {
    try {
        await sql`DELETE FROM reports WHERE id = ${id}`;
        return true;
    } catch (error) {
        console.error('Error deleting report:', error);
        return false;
    }
}

/**
 * Get reports count
 */
export async function getReportsCount(filters: ReportFilters = {}): Promise<number> {
    try {
        let query = `SELECT COUNT(*) as count FROM reports WHERE 1=1`;
        const params: unknown[] = [];
        let paramIndex = 1;

        if (filters.type) {
            query += ` AND type = $${paramIndex}`;
            params.push(filters.type);
            paramIndex++;
        }

        if (filters.status) {
            query += ` AND status = $${paramIndex}`;
            params.push(filters.status);
            paramIndex++;
        }

        if (filters.userId) {
            query += ` AND user_id = $${paramIndex}`;
            params.push(filters.userId);
        }

        // @ts-ignore - neon types don't officially support unsafe strictly with params in some versions
        const result = await (sql as any).unsafe(query, params);
        return Number(result[0].count);
    } catch (error) {
        console.error('Error fetching reports count:', error);
        return 0;
    }
}

/**
 * Get reports for specific user
 */
export async function getUserReports(userId: string): Promise<Report[]> {
    try {
        const result = await sql`
            SELECT * FROM reports 
            WHERE user_id = ${userId}
            ORDER BY created_at DESC
        `;

        // Fetch images for each report
        const reportsWithImages = await Promise.all(result.map(async (report) => {
            const images = await sql`
                SELECT image_url FROM report_images WHERE report_id = ${report.id}
            `;
            return {
                ...report,
                images: images.map((img: any) => img.image_url)
            } as Report;
        }));

        return reportsWithImages;
    } catch (error) {
        console.error('Error fetching user reports:', error);
        return [];
    }
}