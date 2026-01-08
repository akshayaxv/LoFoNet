/**
 * Browser Notifications Service
 */

// Notification permission state
export type NotificationPermission = 'granted' | 'denied' | 'default';

/**
 * Check if browser supports notifications
 */
export function isNotificationSupported(): boolean {
    return 'Notification' in window;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
    if (!isNotificationSupported()) return 'denied';
    return Notification.permission as NotificationPermission;
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
    if (!isNotificationSupported()) {
        console.warn('Browser does not support notifications');
        return 'denied';
    }

    try {
        const permission = await Notification.requestPermission();
        console.log('📢 Notification permission:', permission);

        // Save state in localStorage
        localStorage.setItem('murshid_notification_permission', permission);

        return permission as NotificationPermission;
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return 'denied';
    }
}

/**
 * Show notification in browser
 */
export function showBrowserNotification(
    title: string,
    options?: {
        body?: string;
        icon?: string;
        tag?: string;
        onClick?: () => void;
    }
): void {
    if (!isNotificationSupported()) return;
    if (Notification.permission !== 'granted') return;

    const notification = new Notification(title, {
        body: options?.body,
        icon: options?.icon || '/favicon.ico',
        tag: options?.tag,
        dir: 'ltr',
        lang: 'en',
    });

    if (options?.onClick) {
        notification.onclick = () => {
            window.focus();
            options.onClick?.();
            notification.close();
        };
    }

    // Auto-close after 5 seconds
    setTimeout(() => notification.close(), 5000);
}

/**
 * Check if user has previously denied notifications
 */
export function hasUserDeniedNotifications(): boolean {
    return getNotificationPermission() === 'denied';
}

/**
 * Check if user has accepted notifications
 */
export function hasUserAcceptedNotifications(): boolean {
    return getNotificationPermission() === 'granted';
}

/**
 * Check if user has not been asked about notifications yet
 */
export function shouldAskForNotifications(): boolean {
    return getNotificationPermission() === 'default';
}

/**
 * Show match notification
 */
export function showMatchNotification(matchTitle: string): void {
    showBrowserNotification('🎉 New Match!', {
        body: `A match was found: ${matchTitle}`,
        tag: 'match',
        onClick: () => {
            window.location.href = '/notifications';
        },
    });
}

/**
 * Show report status update notification
 */
export function showStatusUpdateNotification(reportTitle: string, newStatus: string): void {
    showBrowserNotification('📋 Report Update', {
        body: `The status of "${reportTitle}" was updated to: ${newStatus}`,
        tag: 'status',
        onClick: () => {
            window.location.href = '/reports';
        },
    });
}