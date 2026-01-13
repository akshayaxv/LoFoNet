import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ReportsList } from '@/components/reports/ReportsList';
import { getReports, Report, deleteReport } from '@/services/reportService';
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
    // Wait until authentication loading is complete
    if (!authLoading) {
      loadReports();
    }
  }, [authLoading, user]);

  const loadReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch all reports if Admin, or only user's reports
      const filters = user && user.role !== 'admin' ? { userId: user.id } : {};
      console.log('Fetching reports with filter:', filters);
      const data = await getReports(filters);
      console.log('Reports fetched:', data.length);
      setReports(data);
    } catch (err) {
      console.error('Error loading reports:', err);
      setError('An error occurred while loading reports');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (reportId: string) => {
    // Confirmation dialog
    if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('Deleting report:', reportId);
      const success = await deleteReport(reportId);
      
      if (success) {
        // Remove the deleted report from the state
        setReports(reports.filter(report => report.id !== reportId));
        console.log('✅ Report deleted successfully');
        
        // Optional: Show success message
        alert('Report deleted successfully!');
      } else {
        throw new Error('Delete operation returned false');
      }
    } catch (err) {
      console.error('❌ Error deleting report:', err);
      alert('Failed to delete the report. Please try again.');
    }
  };

  // Show loading while authentication or reports are loading
  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20" dir="ltr">
          <div className="text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Loading reports...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div dir="ltr">
        <div className="flex items-center justify-between mb-6">
          <div className="text-left">
            <h1 className="text-3xl font-bold text-foreground text-left">Reports</h1>
            <p className="text-muted-foreground mt-2 text-left">
              {user?.role === 'admin' ? 'All registered reports' : 'Your registered reports'}
            </p>
          </div>
          <Link to="/new-report">
            <Button variant="hero">
              <Plus className="h-4 w-4 mr-2" />
              New Report
            </Button>
          </Link>
        </div>

        {error ? (
          <div className="text-center py-20">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">An error occurred</h3>
            <p className="text-muted-foreground">{error}</p>
            <Button variant="outline" className="mt-4" onClick={loadReports}>
              Retry
            </Button>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-20">
            <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No reports</h3>
            <p className="text-muted-foreground mb-4">No reports have been registered yet</p>
            <Link to="/new-report">
              <Button variant="hero">
                <Plus className="h-4 w-4 mr-2" />
                Register first report
              </Button>
            </Link>
          </div>
        ) : (
          <ReportsList reports={reports} onDelete={handleDelete} />
        )}
      </div>
    </Layout>
  );
};

export default Reports;