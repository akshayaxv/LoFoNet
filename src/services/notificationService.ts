import { sql } from '@/lib/db';

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: 'match' | 'status' | 'system' | 'admin';
    is_read: boolean;
    related_report_id?: string;
    related_match_id?: string;
    created_at: string;
    // Joined data
    user_name?: string;
    user_email?: string;
}

// ==================== Creating Notifications ====================

/**
 * Create a new notification
 */
export async function createNotification(data: {
    user_id: string;
    title: string;
    message: string;
    type: 'match' | 'status' | 'system' | 'admin';
    related_report_id?: string;
    related_match_id?: string;
}): Promise<Notification | null> {
    try {
        const result = await sql`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (${data.user_id}, ${data.title}, ${data.message}, ${data.type})
      RETURNING *
    `;
        console.log('✅ New notification created');
        return result[0] as Notification;
    } catch (error) {
        console.error('❌ Error creating notification:', error);
        return null;
    }
}

/**
 * Send potential match notification to admin
 */
export async function notifyAdminsOfMatch(matchId: string, lostReportTitle: string, foundReportTitle: string, score: number): Promise<void> {
    try {
        // Fetch all admins
        const admins = await sql`
      SELECT id FROM users WHERE role = 'admin' OR role = 'moderator'
    `;

        const scorePercent = Math.round(score * 100);

        for (const admin of admins) {
            await createNotification({
                user_id: admin.id,
                title: '🔍 New Potential Match!',
                message: `A match of ${scorePercent}% has been detected between "${lostReportTitle}" and "${foundReportTitle}". Please review and take action.`,
                type: 'match',
                related_match_id: matchId,
            });
        }

        console.log(`✅ Notification sent to ${admins.length} admins`);
    } catch (error) {
        console.error('❌ Error sending notifications to admins:', error);
    }
}

/**
 * Send notification to user when match is confirmed
 */
export async function notifyUserOfConfirmedMatch(
    userId: string,
    reportTitle: string,
    matchedReportTitle: string
): Promise<void> {
    try {
        await createNotification({
            user_id: userId,
            title: '🎉 Match Found!',
            message: `Good news! Your report "${reportTitle}" has been matched with "${matchedReportTitle}". Please contact to retrieve the item.`,
            type: 'match',
        });
        console.log('✅ Notification sent to user');
    } catch (error) {
        console.error('❌ Error sending notification to user:', error);
    }
}

/**
 * Send report status change notification
 */
export async function notifyUserOfStatusChange(
    userId: string,
    reportTitle: string,
    newStatus: string
): Promise<void> {
    const statusMessages: Record<string, string> = {
        pending: 'Pending',
        processing: 'Processing and searching for matches',
        matched: 'Match found!',
        contacted: 'Contacted',
        closed: 'Report closed',
    };

    try {
        await createNotification({
            user_id: userId,
            title: '📋 Report Status Update',
            message: `Your report "${reportTitle}" status has been updated to: ${statusMessages[newStatus] || newStatus}`,
            type: 'status',
        });
    } catch (error) {
        console.error('❌ Error sending status change notification:', error);
    }
}

// ==================== Fetching Notifications ====================

/**
 * Get user notifications
 */
export async function getUserNotifications(userId: string, limit = 20): Promise<Notification[]> {
    try {
        const notifications = await sql`
      SELECT * FROM notifications
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
        return notifications as Notification[];
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }
}

/**
 * Get unread notifications count
 */
export async function getUnreadNotificationsCount(userId: string): Promise<number> {
    try {
        const result = await sql`
      SELECT COUNT(*) as count FROM notifications
      WHERE user_id = ${userId} AND is_read = false
    `;
        return Number(result[0]?.count || 0);
    } catch (error) {
        console.error('Error fetching notification count:', error);
        return 0;
    }
}

/**
 * Get all notifications (for admin)
 */
export async function getAllNotifications(limit = 50): Promise<Notification[]> {
    try {
        const notifications = await sql`
      SELECT n.*, u.name as user_name, u.email as user_email
      FROM notifications n
      LEFT JOIN users u ON n.user_id = u.id
      ORDER BY n.created_at DESC
      LIMIT ${limit}
    `;
        return notifications as Notification[];
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }
}

// ==================== Managing Notifications ====================

/**
 * Update read status
 */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
        await sql`
      UPDATE notifications SET is_read = true
      WHERE id = ${notificationId}
    `;
        return true;
    } catch (error) {
        console.error('Error updating notification:', error);
        return false;
    }
}

/**
 * Mark all user notifications as read
 */
export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
    try {
        await sql`
      UPDATE notifications SET is_read = true
      WHERE user_id = ${userId}
    `;
        return true;
    } catch (error) {
        console.error('Error updating notifications:', error);
        return false;
    }
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId: string): Promise<boolean> {
    try {
        await sql`DELETE FROM notifications WHERE id = ${notificationId}`;
        return true;
    } catch (error) {
        console.error('Error deleting notification:', error);
        return false;
    }
}