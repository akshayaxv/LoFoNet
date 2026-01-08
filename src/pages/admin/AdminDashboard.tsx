import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getSystemStats } from '@/lib/db';
import { getReports, Report } from '@/services/reportService';
import {
    FileSearch,
    MapPin,
    CheckCircle,
    Users,
    TrendingUp,
    ArrowLeft,
    Clock,
    AlertCircle,
    Loader2,
} from 'lucide-react';

interface Stats {
    totalLostReports: number;
    totalFoundReports: number;
    successfulMatches: number;
    totalUsers: number;
    matchRate: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [recentReports, setRecentReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statsData, reportsData] = await Promise.all([
                getSystemStats(),
                getReports({ limit: 5 }),
            ]);
            setStats(statsData);
            setRecentReports(reportsData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: 'default' | 'destructive' | 'success' | 'warning' | 'secondary', label: string }> = {
            pending: { variant: 'warning', label: 'Pending' },
            processing: { variant: 'secondary', label: 'Processing' },
            matched: { variant: 'success', label: 'Matched' },
            contacted: { variant: 'default', label: 'Contacted' },
            closed: { variant: 'destructive', label: 'Closed' },
        };
        const { variant, label } = variants[status] || { variant: 'default', label: status };
        return <Badge variant={variant}>{label}</Badge>;
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="text-center space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                        <p className="text-muted-foreground">Loading data...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground mt-1">Welcome to Murshid Management System</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-200/50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Lost Reports</p>
                                <p className="text-3xl font-bold text-foreground mt-1">
                                    {stats?.totalLostReports.toLocaleString('en-US') || 0}
                                </p>
                            </div>
                            <div className="h-14 w-14 rounded-2xl bg-red-500/20 flex items-center justify-center">
                                <FileSearch className="h-7 w-7 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200/50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Found Reports</p>
                                <p className="text-3xl font-bold text-foreground mt-1">
                                    {stats?.totalFoundReports.toLocaleString('en-US') || 0}
                                </p>
                            </div>
                            <div className="h-14 w-14 rounded-2xl bg-green-500/20 flex items-center justify-center">
                                <MapPin className="h-7 w-7 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Successful Matches</p>
                                <p className="text-3xl font-bold text-foreground mt-1">
                                    {stats?.successfulMatches.toLocaleString('en-US') || 0}
                                </p>
                            </div>
                            <div className="h-14 w-14 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                                <CheckCircle className="h-7 w-7 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200/50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Users</p>
                                <p className="text-3xl font-bold text-foreground mt-1">
                                    {stats?.totalUsers.toLocaleString('en-US') || 0}
                                </p>
                            </div>
                            <div className="h-14 w-14 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                                <Users className="h-7 w-7 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Match Rate Card */}
            <Card className="mb-8">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Successful Match Rate</p>
                            <p className="text-4xl font-bold text-primary mt-2">{stats?.matchRate || 0}%</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Of total registered reports
                            </p>
                        </div>
                        <div className="h-20 w-20 rounded-full gradient-primary flex items-center justify-center">
                            <TrendingUp className="h-10 w-10 text-primary-foreground" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Reports */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Recent Reports
                    </CardTitle>
                    <Link to="/admin/reports">
                        <Button variant="ghost" size="sm" className="gap-2">
                            View All
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    {recentReports.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />
                            <p>No reports yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentReports.map((report) => (
                                <div
                                    key={report.id}
                                    className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${report.type === 'lost' ? 'bg-red-500/20' : 'bg-green-500/20'
                                            }`}>
                                            {report.type === 'lost' ? (
                                                <FileSearch className="h-6 w-6 text-red-600" />
                                            ) : (
                                                <MapPin className="h-6 w-6 text-green-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium">{report.title}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {report.user_name || 'User'} • {new Date(report.created_at).toLocaleDateString('en-US')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {getStatusBadge(report.status)}
                                        <Link to={`/admin/reports/${report.id}`}>
                                            <Button variant="ghost" size="sm">
                                                View
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </AdminLayout>
    );
}