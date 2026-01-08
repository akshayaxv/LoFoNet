/**
 * خدمة إشعارات المتصفح (Browser Notifications)
 */

// حالة صلاحية الإشعارات
export type NotificationPermission = 'granted' | 'denied' | 'default';

/**
 * التحقق من دعم المتصفح للإشعارات
 */
export function isNotificationSupported(): boolean {
    return 'Notification' in window;
}

/**
 * الحصول على حالة صلاحية الإشعارات الحالية
 */
export function getNotificationPermission(): NotificationPermission {
    if (!isNotificationSupported()) return 'denied';
    return Notification.permission as NotificationPermission;
}

/**
 * طلب صلاحية الإشعارات من المستخدم
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
    if (!isNotificationSupported()) {
        console.warn('المتصفح لا يدعم الإشعارات');
        return 'denied';
    }

    try {
        const permission = await Notification.requestPermission();
        console.log('📢 صلاحية الإشعارات:', permission);

        // حفظ الحالة في localStorage
        localStorage.setItem('murshid_notification_permission', permission);

        return permission as NotificationPermission;
    } catch (error) {
        console.error('خطأ في طلب صلاحية الإشعارات:', error);
        return 'denied';
    }
}

/**
 * إظهار إشعار في المتصفح
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
        dir: 'rtl',
        lang: 'ar',
    });

    if (options?.onClick) {
        notification.onclick = () => {
            window.focus();
            options.onClick?.();
            notification.close();
        };
    }

    // إغلاق تلقائي بعد 5 ثواني
    setTimeout(() => notification.close(), 5000);
}

/**
 * التحقق مما إذا كان المستخدم قد رفض الإشعارات سابقاً
 */
export function hasUserDeniedNotifications(): boolean {
    return getNotificationPermission() === 'denied';
}

/**
 * التحقق مما إذا كان المستخدم قد قبل الإشعارات
 */
export function hasUserAcceptedNotifications(): boolean {
    return getNotificationPermission() === 'granted';
}

/**
 * التحقق مما إذا لم يُسأل المستخدم عن الإشعارات بعد
 */
export function shouldAskForNotifications(): boolean {
    return getNotificationPermission() === 'default';
}

/**
 * إظهار إشعار تطابق
 */
export function showMatchNotification(matchTitle: string): void {
    showBrowserNotification('🎉 تطابق جديد!', {
        body: `تم العثور على تطابق: ${matchTitle}`,
        tag: 'match',
        onClick: () => {
            window.location.href = '/notifications';
        },
    });
}

/**
 * إظهار إشعار تحديث حالة البلاغ
 */
export function showStatusUpdateNotification(reportTitle: string, newStatus: string): void {
    showBrowserNotification('📋 تحديث البلاغ', {
        body: `تم تحديث حالة "${reportTitle}" إلى: ${newStatus}`,
        tag: 'status',
        onClick: () => {
            window.location.href = '/reports';
        },
    });
}
