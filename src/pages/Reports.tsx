import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ReportsList } from '@/components/reports/ReportsList';
import { getReports, Report } from '@/services/reportService';
import { Loader2, AlertCircle, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Reports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    // انتظار حتى ينتهي تحميل المصادقة
    if (!authLoading) {
      loadReports();
    }
  }, [authLoading, user]);

  const loadReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // جلب جميع البلاغات إذا كان Admin، أو بلاغات المستخدم فقط
      const filters = user && user.role !== 'admin' ? { userId: user.id } : {};
      console.log('جاري جلب البلاغات بالفلتر:', filters);
      const data = await getReports(filters);
      console.log('تم جلب البلاغات:', data.length);
      setReports(data);
    } catch (err) {
      console.error('خطأ في تحميل البلاغات:', err);
      setError('حدث خطأ أثناء تحميل البلاغات');
    } finally {
      setIsLoading(false);
    }
  };

  // عرض التحميل أثناء تحميل المصادقة أو البلاغات
  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">جاري تحميل البلاغات...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">البلاغات</h1>
          <p className="text-muted-foreground mt-2">
            {user?.role === 'admin' ? 'جميع البلاغات المسجلة' : 'بلاغاتك المسجلة'}
          </p>
        </div>
        <Link to="/new-report">
          <Button variant="hero">
            <Plus className="h-4 w-4" />
            بلاغ جديد
          </Button>
        </Link>
      </div>

      {error ? (
        <div className="text-center py-20">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">حدث خطأ</h3>
          <p className="text-muted-foreground">{error}</p>
          <Button variant="outline" className="mt-4" onClick={loadReports}>
            إعادة المحاولة
          </Button>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-20">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">لا توجد بلاغات</h3>
          <p className="text-muted-foreground mb-4">لم يتم تسجيل أي بلاغات بعد</p>
          <Link to="/new-report">
            <Button variant="hero">
              <Plus className="h-4 w-4" />
              سجل أول بلاغ
            </Button>
          </Link>
        </div>
      ) : (
        <ReportsList reports={reports} />
      )}
    </Layout>
  );
};

export default Reports;
