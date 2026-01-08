import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MapPin,
  Calendar,
  Search,
  Eye,
  Sparkles,
  FileSearch,
} from 'lucide-react';
import { categoryLabels, statusLabels } from '@/data/mockData';
import { Report } from '@/services/reportService';

interface ReportsListProps {
  reports: Report[];
}

export function ReportsList({ reports }: ReportsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="shadow-md border-0">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث في البلاغات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select
              value={typeFilter}
              onValueChange={setTypeFilter}
            >
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="نوع البلاغ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="lost">مفقود</SelectItem>
                <SelectItem value="found">موجود</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="pending">قيد الانتظار</SelectItem>
                <SelectItem value="processing">جاري الفحص</SelectItem>
                <SelectItem value="matched">تم التطابق</SelectItem>
                <SelectItem value="closed">مغلق</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          عرض {filteredReports.length} من {reports.length} بلاغ
        </p>
      </div>

      {/* Reports Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredReports.map((report, index) => (
          <Card
            key={report.id}
            className="group animate-fade-in overflow-hidden shadow-lg border-0 hover:shadow-xl transition-all duration-300"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <CardContent className="p-0">
              {/* Image */}
              <div className="relative aspect-video overflow-hidden bg-muted">
                {report.images && report.images.length > 0 ? (
                  <ImageWithFallback
                    src={report.images[0]}
                    alt={report.title}
                    fallbackSrc="https://placehold.co/600x400/e2e8f0/94a3b8?text=لا+توجد+صورة"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileSearch className="h-16 w-16 text-muted-foreground/50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                <div className="absolute top-3 right-3 flex gap-2">
                  <Badge variant={report.type === 'lost' ? 'destructive' : 'success'}>
                    {report.type === 'lost' ? 'مفقود' : 'موجود'}
                  </Badge>
                </div>
                <div className="absolute top-3 left-3">
                  {report.status === 'matched' && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-success text-success-foreground text-xs">
                      <Sparkles className="h-3 w-3" />
                      تطابق!
                    </div>
                  )}
                </div>
                <div className="absolute bottom-3 right-3 left-3">
                  <h3 className="text-primary-foreground font-bold text-lg truncate">
                    {report.title}
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {report.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
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
                    className="text-xs"
                  >
                    {statusLabels[report.status] || report.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {report.location_city}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(report.date_occurred).toLocaleDateString('ar-SA')}
                  </div>
                </div>

                <Link to={`/reports/${report.id}`}>
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <Eye className="h-4 w-4" />
                    عرض التفاصيل
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <Card className="p-12 text-center shadow-md border-0">
          <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-2">لا توجد نتائج</h3>
          <p className="text-muted-foreground">
            جرب تغيير معايير البحث أو الفلترة
          </p>
        </Card>
      )}
    </div>
  );
}
