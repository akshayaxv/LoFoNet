import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import {
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    Notification,
} from '@/services/notificationService';
import {
    Bell,
    CheckCheck,
    Loader2,
    Sparkles,
    FileText,
    Shield,
    Clock,
    ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const notificationIcons: Record<string, typeof Bell> = {
    match: Sparkles,
    status: FileText,
    system: Bell,
    admin: Shield,
};

const notificationColors: Record<string, string> = {
    match: 'bg-success/10 text-success',
    status: 'bg-primary/10 text-primary',
    system: 'bg-muted text-muted-foreground',
    admin: 'bg-destructive/10 text-destructive',
};

export default function Notifications() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadNotifications();
        }
    }, [user]);

    const loadNotifications = async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            const data = await getUserNotifications(user.id);
            setNotifications(data);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Click on notification - redirects to appropriate page
    const handleNotificationClick = async (notification: Notification) => {
        // Mark as read
        if (!notification.is_read) {
            await markNotificationAsRead(notification.id);
            setNotifications(prev =>
                prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
            );
        }

        // Redirect based on notification type
        if (notification.type === 'match') {
            // Match notification - redirects to my reports to see details
            navigate('/reports');
        } else if (notification.related_report_id) {
            // Notification related to a report
            navigate(`/reports/${notification.related_report_id}`);
        } else {
            // General notification
            navigate('/reports');
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!user) return;
        await markAllNotificationsAsRead(user.id);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    if (isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center py-20">
                    <div className="text-center space-y-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                        <p className="text-muted-foreground">Loading notifications...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <Bell className="h-8 w-8 text-primary" />
                        Notifications
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All notifications read'}
                    </p>
                </div>

                {unreadCount > 0 && (
                    <Button variant="outline" onClick={handleMarkAllAsRead}>
                        <CheckCheck className="h-4 w-4 mr-2" />
                        Mark all as read
                    </Button>
                )}
            </div>

            {/* Notifications List */}
            {notifications.length === 0 ? (
                <Card className="border-0 shadow-xl">
                    <CardContent className="p-12 text-center">
                        <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No notifications</h3>
                        <p className="text-muted-foreground">Notifications will appear here when a match is confirmed for your report</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {notifications.map((notification) => {
                        const Icon = notificationIcons[notification.type] || Bell;
                        const colorClass = notificationColors[notification.type] || notificationColors.system;

                        return (
                            <Card
                                key={notification.id}
                                className={cn(
                                    "border-0 shadow-md transition-all duration-200 cursor-pointer hover:shadow-lg hover:scale-[1.01]",
                                    !notification.is_read && "bg-primary/5 border-l-4 border-l-primary"
                                )}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className={cn(
                                            "h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0",
                                            colorClass
                                        )}>
                                            <Icon className="h-6 w-6" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className={cn(
                                                    "font-semibold",
                                                    !notification.is_read && "text-primary"
                                                )}>
                                                    {notification.title}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    {!notification.is_read && (
                                                        <Badge variant="default" className="text-xs">New</Badge>
                                                    )}
                                                    <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                            </div>
                                            <p className="text-muted-foreground text-sm line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                {new Date(notification.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </Layout>
    );
}