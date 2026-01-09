import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { getReportById, Report } from '@/services/reportService';
import { sql } from '@/lib/db';
import { categoryLabels, statusLabels } from '@/data/mockData';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Tag,
    Palette,
    FileText,
    Sparkles,
    User,
    Mail,
    Clock,
    Loader2,
    AlertCircle,
    Share2,
    Phone,
    MessageCircle,
    CheckCircle,
    ExternalLink,
} from 'lucide-react';

interface MatchedReport {
    id: string;
    title: string;
    description: string;
    location_city: string;
    location_address?: string;
    user_name: string;
    user_phone?: string;
    user_email: string;
    images?: string[];
    date_occurred: string;
}

export default function ReportDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [report, setReport] = useState<Report | null>(null);
    const [matchedReport, setMatchedReport] = useState<MatchedReport | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            loadReport(id);
        }
    }, [id]);

    const loadReport = async (reportId: string) => {
        setIsLoading(true);
        try {
            const data = await getReportById(reportId);
            setReport(data);
            if (data?.images && data.images.length > 0) {
                setSelectedImage(data.images[0]);
            }

            // If the report is matched, fetch information about the other party
            if (data?.status === 'matched') {
                await loadMatchedReport(reportId, data.type);
            }
        } catch (error) {
            console.error('Error loading report:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch matched report information
    const loadMatchedReport = async (reportId: string, type: string) => {
        try {
            // Search for the match
            const isLost = type === 'lost';
            const matchColumn = isLost ? 'lost_report_id' : 'found_report_id';
            const otherColumn = isLost ? 'found_report_id' : 'lost_report_id';

            const matches = await sql`
                SELECT * FROM ai_matches 
                WHERE ${sql.unsafe(matchColumn)} = ${reportId}
                AND status = 'confirmed'
                LIMIT 1
            `;

            if (matches.length > 0) {
                const otherReportId = matches[0][otherColumn];

                // Fetch information about the other report with user details
                const otherReports = await sql`
                    SELECT r.*, u.name as user_name, u.phone as user_phone, u.email as user_email,
                        ARRAY(SELECT image_url FROM report_images WHERE report_id = r.id) as images
                    FROM reports r
                    LEFT JOIN users u ON r.user_id = u.id
                    WHERE r.id = ${otherReportId}
                `;

                if (otherReports.length > 0) {
                    setMatchedReport(otherReports[0] as MatchedReport);
                }
            }
        } catch (error) {
            console.error('Error fetching match information:', error);
        }
    };

    // Share report
    const handleShare = async () => {
        const shareData = {
            title: `${report?.type === 'lost' ? 'Lost' : 'Found'} Report: ${report?.title}`,
            text: `${report?.description}\n\nCity: ${report?.location_city}`,
            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied!');
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    // Open WhatsApp
    const openWhatsApp = (phone: string) => {
        const cleanPhone = phone.replace(/\D/g, '');
        const message = `Hello, I'm contacting you regarding the report: ${report?.title}`;
        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    // Make call
    const makeCall = (phone: string) => {
        window.location.href = `tel:${phone}`;
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center py-20" dir="ltr">
                    <div className="text-center space-y-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                        <p className="text-muted-foreground">Loading report details...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!report) {
        return (
            <Layout>
                <div className="text-center py-20" dir="ltr">
                    <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Report not found</h3>
                    <p className="text-muted-foreground mb-4">The requested report was not found</p>
                    <Button variant="outline" onClick={() => navigate('/reports')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to reports
                    </Button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div dir="ltr">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    className="mb-4"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Images */}
                        <Card className="overflow-hidden border-0 shadow-xl">
                            <CardContent className="p-0">
                                {/* Main Image */}
                                <div className="relative aspect-video bg-muted">
                                    {selectedImage ? (
                                        <ImageWithFallback
                                            src={selectedImage}
                                            alt={report.title}
                                            fallbackSrc="https://placehold.co/800x600/e2e8f0/94a3b8?text=No+Image"
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <FileText className="h-20 w-20 text-muted-foreground/50" />
                                        </div>
                                    )}

                                    {/* Type Badge */}
                                    <div className="absolute top-4 left-4">
                                        <Badge
                                            variant={report.type === 'lost' ? 'destructive' : 'success'}
                                            className="text-sm px-3 py-1"
                                        >
                                            {report.type === 'lost' ? 'Lost' : 'Found'}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Thumbnails */}
                                {report.images && report.images.length > 1 && (
                                    <div className="flex gap-2 p-4 overflow-x-auto">
                                        {report.images.map((img, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedImage(img)}
                                                className={cn(
                                                    "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                                                    selectedImage === img
                                                        ? "border-primary ring-2 ring-primary/20"
                                                        : "border-transparent hover:border-muted-foreground/30"
                                                )}
                                            >
                                                <ImageWithFallback
                                                    src={img}
                                                    alt={`Image ${idx + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Details */}
                        <Card className="border-0 shadow-xl">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="text-left">
                                        <CardTitle className="text-2xl mb-2 text-left">{report.title}</CardTitle>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline">
                                                {categoryLabels[report.category] || report.category}
                                            </Badge>
                                            <Badge
                                                variant={
                                                    report.status === 'matched'
                                                        ? 'success'
                                                        : report.status === 'processing'
                                                            ? 'secondary'
                                                            : report.status === 'pending'
                                                                ? 'warning'
                                                                : 'destructive'
                                                }
                                            >
                                                {statusLabels[report.status] || report.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Description */}
                                <div className="text-left">
                                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-left">
                                        <FileText className="h-4 w-4 text-primary" />
                                        Description
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed text-left">
                                        {report.description}
                                    </p>
                                </div>

                                {/* Details Grid */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    {report.color && (
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                            <Palette className="h-5 w-5 text-primary" />
                                            <div className="text-left">
                                                <p className="text-sm text-muted-foreground text-left">Color</p>
                                                <p className="font-medium text-left">{report.color}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                        <Calendar className="h-5 w-5 text-primary" />
                                        <div className="text-left">
                                            <p className="text-sm text-muted-foreground text-left">
                                                {report.type === 'lost' ? 'Date Lost' : 'Date Found'}
                                            </p>
                                            <p className="font-medium text-left">
                                                {new Date(report.date_occurred).toLocaleDateString('en-US')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                        <MapPin className="h-5 w-5 text-primary" />
                                        <div className="text-left">
                                            <p className="text-sm text-muted-foreground text-left">City</p>
                                            <p className="font-medium text-left">{report.location_city}</p>
                                        </div>
                                    </div>

                                    {report.location_address && (
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                            <MapPin className="h-5 w-5 text-primary" />
                                            <div className="text-left">
                                                <p className="text-sm text-muted-foreground text-left">Location</p>
                                                <p className="font-medium text-left">{report.location_address}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Distinguishing Marks */}
                                {report.distinguishing_marks && (
                                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                                        <h3 className="font-semibold mb-2 flex items-center gap-2 text-left">
                                            <Sparkles className="h-4 w-4 text-primary" />
                                            Distinguishing Marks
                                        </h3>
                                        <p className="text-muted-foreground text-left">{report.distinguishing_marks}</p>
                                    </div>
                                )}

                                {/* Timestamps */}
                                <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t text-left">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        Created: {new Date(report.created_at).toLocaleDateString('en-US')}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Matched Report Info - Most Important */}
                        {report.status === 'matched' && matchedReport && (
                            <Card className="border-2 border-success shadow-xl bg-success/5">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2 text-success text-left">
                                        <CheckCircle className="h-5 w-5" />
                                        🎉 Match Found!
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Matched report image */}
                                    {matchedReport.images && matchedReport.images.length > 0 && (
                                        <img
                                            src={matchedReport.images[0]}
                                            alt={matchedReport.title}
                                            className="w-full h-32 object-cover rounded-lg"
                                        />
                                    )}

                                    <div className="text-left">
                                        <h4 className="font-bold text-left">{matchedReport.title}</h4>
                                        <p className="text-sm text-muted-foreground line-clamp-2 text-left">
                                            {matchedReport.description}
                                        </p>
                                    </div>

                                    <div className="text-sm space-y-1 text-left">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            {matchedReport.location_city}
                                            {matchedReport.location_address && ` - ${matchedReport.location_address}`}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            {new Date(matchedReport.date_occurred).toLocaleDateString('en-US')}
                                        </div>
                                    </div>

                                    {/* Contact information */}
                                    <div className="pt-3 border-t text-left">
                                        <h4 className="font-medium mb-2 flex items-center gap-2 text-left">
                                            <User className="h-4 w-4 text-primary" />
                                            {report.type === 'lost' ? 'Owner of Found Report' : 'Owner of Lost Report'}
                                        </h4>
                                        <p className="text-sm font-medium text-left">{matchedReport.user_name}</p>

                                        <div className="grid grid-cols-2 gap-2 mt-3">
                                            {matchedReport.user_phone && (
                                                <>
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700 gap-1"
                                                        onClick={() => openWhatsApp(matchedReport.user_phone!)}
                                                    >
                                                        <MessageCircle className="h-4 w-4" />
                                                        WhatsApp
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="gap-1"
                                                        onClick={() => makeCall(matchedReport.user_phone!)}
                                                    >
                                                        <Phone className="h-4 w-4" />
                                                        Call
                                                    </Button>
                                                </>
                                            )}
                                        </div>

                                        {!matchedReport.user_phone && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full mt-2 gap-1"
                                                onClick={() => window.location.href = `mailto:${matchedReport.user_email}`}
                                            >
                                                <Mail className="h-4 w-4" />
                                                {matchedReport.user_email}
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Reporter Info - Only for regular non-matched users */}
                        {report.status !== 'matched' && (
                            <Card className="border-0 shadow-xl">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2 text-left">
                                        <User className="h-5 w-5 text-primary" />
                                        Report Owner
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                                            {report.user_name?.charAt(0) || 'U'}
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium text-left">{report.user_name || 'User'}</p>
                                            <p className="text-sm text-muted-foreground text-left">{report.user_email}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Processing Status */}
                        {report.status === 'processing' && (
                            <Card className="border-0 shadow-xl bg-primary/5 border-primary/20">
                                <CardContent className="p-6 text-center">
                                    <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">Searching for Match</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Your report is being compared with other reports. We'll send you a notification when a match is found.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </Layout >
    );
}