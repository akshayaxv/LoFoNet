import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Phone, Mail, Shield, Save, Loader2, FileSearch } from 'lucide-react';
import { toast } from 'sonner';
import { sql } from '@/lib/db';
import { ReportsList } from '@/components/reports/ReportsList';
import { Report, getUserReports } from '@/services/reportService';

export default function Profile() {
    const { user, login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [userReports, setUserReports] = useState<Report[]>([]);
    const [isLoadingReports, setIsLoadingReports] = useState(false);

    // Form State
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        if (user) {
            setName(user.name);
            setPhone(user.phone || '');
            loadUserReports();
        }
    }, [user]);

    const loadUserReports = async () => {
        if (!user) return;
        setIsLoadingReports(true);
        try {
            const reports = await getUserReports(user.id);
            setUserReports(reports);
        } catch (error) {
            console.error('Error loading reports:', error);
        } finally {
            setIsLoadingReports(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsLoading(true);
        try {
            // تحديث البيانات في قاعدة البيانات
            await sql`
                UPDATE users 
                SET name = ${name}, phone = ${phone}, updated_at = NOW()
                WHERE id = ${user.id}
            `;

            // تحديث الحالة المحلية
            /* 
               ملاحظة: في السيناريو المثالي يجب أن يكون لدينا دالة updateProfile في AuthContext 
               لكن سنقوم بتحديث الحالة بتسجيل الدخول مجدداً بنفس التوكن للمحاكاة أو تنشيط الـ context
               هنا سنكتفي برسالة النجاح لأن الـ user state قد يحتاج ريفريش
            */

            toast.success('تم تحديث الملف الشخصي بنجاح');
        } catch (error) {
            console.error('Update error:', error);
            toast.error('حدث خطأ أثناء تحديث البيانات');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        // هذه الميزة تتطلب تحقق من كلمة المرور الحالية في الباك إند
        toast.info('تغيير كلمة المرور غير متاح حالياً في هذه النسخة التجريبية');
    };

    if (!user) return null;

    return (
        <Layout>
            <div className="container max-w-4xl py-6 md:py-10 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">الملف الشخصي</h1>
                    <p className="text-muted-foreground mt-2">إدارة حسابك وبلاغاتك</p>
                </div>

                <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                        <TabsTrigger value="details">بياناتي</TabsTrigger>
                        <TabsTrigger value="reports">بلاغاتي</TabsTrigger>
                    </TabsList>

                    {/* Profile Details Tab */}
                    <TabsContent value="details" className="pt-6">
                        <div className="grid gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>المعلومات الشخصية</CardTitle>
                                    <CardDescription>
                                        قم بتحديث معلوماتك الشخصية ومعلومات التواصل
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">الاسم الكامل</Label>
                                            <div className="relative">
                                                <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="name"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="pr-10"
                                                    placeholder="اسمك الكامل"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">البريد الإلكتروني</Label>
                                            <div className="relative">
                                                <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="email"
                                                    value={user.email}
                                                    disabled
                                                    className="pr-10 bg-muted"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone">رقم الهاتف</Label>
                                            <div className="relative">
                                                <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="phone"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    className="pr-10"
                                                    placeholder="05xxxxxxxx"
                                                    dir="ltr"
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                سيظهر رقم هاتفك للمستخدمين الآخرين عند وجود تطابق
                                            </p>
                                        </div>

                                        <Button type="submit" disabled={isLoading}>
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    جاري الحفظ...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="mr-2 h-4 w-4" />
                                                    حفظ التغييرات
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>الأمان</CardTitle>
                                    <CardDescription>
                                        تغيير كلمة المرور
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="current-password">كلمة المرور الحالية</Label>
                                            <div className="relative">
                                                <Shield className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="current-password"
                                                    type="password"
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    className="pr-10"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
                                            <div className="relative">
                                                <Shield className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="new-password"
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    className="pr-10"
                                                />
                                            </div>
                                        </div>

                                        <Button type="submit" variant="outline">
                                            تغيير كلمة المرور
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Reports Tab */}
                    <TabsContent value="reports" className="pt-6">
                        {isLoadingReports ? (
                            <div className="text-center py-20">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                                <p className="mt-2 text-muted-foreground">جاري تحميل بلاغاتك...</p>
                            </div>
                        ) : userReports.length > 0 ? (
                            <ReportsList reports={userReports} />
                        ) : (
                            <div className="text-center py-20 border rounded-lg bg-muted/20">
                                <FileSearch className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium">لا توجد بلاغات</h3>
                                <p className="text-muted-foreground mb-4">لم تقم بإضافة أي بلاغات بعد</p>
                                <Button onClick={() => window.location.href = '/new-report'}>
                                    إضافة بلاغ جديد
                                </Button>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </Layout>
    );
}
