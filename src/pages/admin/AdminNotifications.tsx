import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    getAllNotifications,
    deleteNotification,
    Notification,
} from '@/services/notificationService';
import {
    Bell,
    Search,
    Loader2,
    Trash2,
    Sparkles,
    FileText,
    Shield,
    Clock,
    Users,
    Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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

const typeLabels: Record<string, string> = {
    match: 'تطابق',
    status: 'حالة',
    system: 'نظام',
    admin: 'إدارة',
};

export default function AdminNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        setIsLoading(true);
        try {
            const data = await getAllNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('خطأ في تحميل الإشعارات:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        const success = await deleteNotification(id);
        if (success) {
            setNotifications(prev => prev.filter(n => n.id !== id));
            toast.success('تم حذف الإشعار');
        } else {
            toast.error('خطأ في حذف الإشعار');
        }
    };

    const filteredNotifications = notifications.filter(n => {
        const matchesSearch =
            n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.message.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'all' || n.type === typeFilter;
        return matchesSearch && matchesType;
    });

    // Stats
    const stats = {
        total: notifications.length,
        unread: notifications.filter(n => !n.is_read).length,
        match: notifications.filter(n => n.type === 'match').length,
        status: notifications.filter(n => n.type === 'status').length,
    };

    return (
        <AdminLayout>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                    <Bell className="h-8 w-8 text-primary" />
                    إدارة الإشعارات
                </h1>
                <p className="text-muted-foreground mt-1">عرض وإدارة جميع إشعارات النظام</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4 mb-6">
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Bell className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.total}</p>
                            <p className="text-sm text-muted-foreground">إجمالي الإشعارات</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                            <Bell className="h-6 w-6 text-destructive" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.unread}</p>
                            <p className="text-sm text-muted-foreground">غير مقروءة</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                            <Sparkles className="h-6 w-6 text-success" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.match}</p>
                            <p className="text-sm text-muted-foreground">إشعارات تطابق</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                            <FileText className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.status}</p>
                            <p className="text-sm text-muted-foreground">إشعارات حالة</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="بحث في الإشعارات..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pr-10"
                            />
                        </div>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full md:w-44">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">جميع الأنواع</SelectItem>
                                <SelectItem value="match">تطابق</SelectItem>
                                <SelectItem value="status">حالة</SelectItem>
                                <SelectItem value="system">نظام</SelectItem>
                                <SelectItem value="admin">إدارة</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Notifications List */}
            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="text-center py-20">
                            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-lg font-medium">لا توجد إشعارات</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {filteredNotifications.map((notification) => {
                                const Icon = notificationIcons[notification.type] || Bell;
                                const colorClass = notificationColors[notification.type] || notificationColors.system;

                                return (
                                    <div
                                        key={notification.id}
                                        className={cn(
                                            "p-4 hover:bg-muted/30 transition-colors",
                                            !notification.is_read && "bg-primary/5"
                                        )}
                                    >
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
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold">{notification.title}</h3>
                                                    <Badge variant="outline" className="text-xs">
                                                        {typeLabels[notification.type] || notification.type}
                                                    </Badge>
                                                    {!notification.is_read && (
                                                        <Badge variant="default" className="text-xs">جديد</Badge>
                                                    )}
                                                </div>
                                                <p className="text-muted-foreground text-sm line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(notification.created_at).toLocaleDateString('ar-SA', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </span>
                                                    {notification.user_name && (
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Users className="h-3 w-3" />
                                                            {notification.user_name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(notification.id)}
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </AdminLayout>
    );
}
