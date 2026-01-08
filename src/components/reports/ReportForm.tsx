import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  Search,
  MapPin,
  Upload,
  Calendar,
  Tag,
  Palette,
  FileText,
  Sparkles,
  CheckCircle,
  X,
  Loader2,
  Building2,
  Map,
  Bell,
  BellOff,
} from 'lucide-react';
import { ReportType, ItemCategory } from '@/types';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { createReport } from '@/services/reportService';
import { LocationPicker } from './LocationPicker';
import {
  shouldAskForNotifications,
  requestNotificationPermission,
  hasUserAcceptedNotifications,
} from '@/services/browserNotificationService';

const categories: { value: ItemCategory; label: string }[] = [
  { value: 'electronics', label: 'إلكترونيات' },
  { value: 'documents', label: 'وثائق' },
  { value: 'jewelry', label: 'مجوهرات' },
  { value: 'bags', label: 'حقائب ومحافظ' },
  { value: 'keys', label: 'مفاتيح' },
  { value: 'pets', label: 'حيوانات أليفة' },
  { value: 'clothing', label: 'ملابس' },
  { value: 'other', label: 'أخرى' },
];

import { cities } from '@/data/mockData';

export function ReportForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const initialType = (searchParams.get('type') as ReportType) || 'lost';

  const [reportType, setReportType] = useState<ReportType>(initialType);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory | ''>('');
  const [color, setColor] = useState('');
  const [description, setDescription] = useState('');
  const [distinguishingMarks, setDistinguishingMarks] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [locationCity, setLocationCity] = useState('');
  const [locationLat, setLocationLat] = useState<number | undefined>();
  const [locationLng, setLocationLng] = useState<number | undefined>();
  const [dateOccurred, setDateOccurred] = useState('');
  const [showMap, setShowMap] = useState(false);

  // التحقق من حالة الإشعارات عند التحميل
  useEffect(() => {
    setNotificationsEnabled(hasUserAcceptedNotifications());
    setShowNotificationPrompt(shouldAskForNotifications());
  }, []);

  // طلب تفعيل الإشعارات
  const handleEnableNotifications = async () => {
    const permission = await requestNotificationPermission();
    setNotificationsEnabled(permission === 'granted');
    setShowNotificationPrompt(false);
    if (permission === 'granted') {
      toast.success('تم تفعيل الإشعارات بنجاح!');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).slice(0, 5 - uploadedFiles.length);
      const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file));

      setUploadedFiles((prev) => [...prev, ...newFiles].slice(0, 5));
      setPreviewUrls((prev) => [...prev, ...newPreviewUrls].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const validateForm = () => {
    if (!title.trim()) {
      toast.error('يرجى إدخال عنوان البلاغ');
      return false;
    }
    if (!category) {
      toast.error('يرجى اختيار نوع العنصر');
      return false;
    }
    if (!description.trim()) {
      toast.error('يرجى إدخال وصف تفصيلي');
      return false;
    }
    if (!locationAddress.trim()) {
      toast.error('يرجى إدخال الموقع');
      return false;
    }
    if (!locationCity) {
      toast.error('يرجى اختيار المدينة');
      return false;
    }
    if (!dateOccurred) {
      toast.error('يرجى تحديد التاريخ');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      navigate('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createReport({
        user_id: user.id,
        type: reportType,
        title,
        description,
        category: category as string,
        color: color || undefined,
        distinguishing_marks: distinguishingMarks || undefined,
        date_occurred: dateOccurred,
        location_address: locationAddress,
        location_city: locationCity,
        location_lat: locationLat,
        location_lng: locationLng,
      }, uploadedFiles.length > 0 ? uploadedFiles : undefined);

      if (result.success) {
        toast.success('تم تقديم البلاغ بنجاح!', {
          description: 'سنقوم بتحليل بلاغك ومقارنته مع البلاغات الأخرى',
        });
        navigate('/reports');
      } else {
        toast.error(result.error || 'حدث خطأ أثناء تقديم البلاغ');
      }
    } catch (error) {
      console.error('خطأ في تقديم البلاغ:', error);
      toast.error('حدث خطأ غير متوقع');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto pb-20 md:pb-0">
      <Card className="border-0 shadow-none md:border md:shadow-sm bg-transparent md:bg-card">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">تقديم بلاغ جديد</CardTitle>
          <CardDescription>
            أدخل تفاصيل العنصر بدقة لزيادة فرص المطابقة
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Notification Permission Alert */}
          {showNotificationPrompt && (
            <Alert className="mb-6 border-primary/30 bg-primary/5">
              <Bell className="h-4 w-4 text-primary" />
              <AlertDescription className="flex items-center justify-between">
                <span>
                  فعّل الإشعارات لتصلك تنبيهات عند العثور على تطابق لبلاغك
                </span>
                <Button
                  size="sm"
                  onClick={handleEnableNotifications}
                  className="mr-4"
                >
                  تفعيل
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {notificationsEnabled && (
            <div className="mb-4 text-xs text-success flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              الإشعارات مفعلة - ستصلك تنبيهات عند العثور على تطابق
            </div>
          )}

          {/* Report Type Toggle */}
          <div className="flex gap-2 p-1 bg-muted rounded-xl mb-6">
            <Button
              type="button"
              variant={reportType === 'lost' ? 'default' : 'ghost'}
              className={cn(
                'flex-1 gap-2',
                reportType === 'lost' && 'bg-destructive hover:bg-destructive/90'
              )}
              onClick={() => setReportType('lost')}
            >
              <Search className="h-4 w-4" />
              فقدت شيئاً
            </Button>
            <Button
              type="button"
              variant={reportType === 'found' ? 'default' : 'ghost'}
              className={cn(
                'flex-1 gap-2',
                reportType === 'found' && 'bg-success hover:bg-success/90'
              )}
              onClick={() => setReportType('found')}
            >
              <MapPin className="h-4 w-4" />
              وجدت شيئاً
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                عنوان البلاغ
              </Label>
              <Input
                id="title"
                placeholder="مثال: هاتف آيفون 14 برو"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="text-right"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                نوع العنصر
              </Label>
              <Select value={category} onValueChange={(v) => setCategory(v as ItemCategory)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع العنصر" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label htmlFor="color" className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                اللون
              </Label>
              <Input
                id="color"
                placeholder="مثال: أزرق داكن"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="text-right"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                الوصف التفصيلي
              </Label>
              <Textarea
                id="description"
                placeholder="اكتب وصفاً دقيقاً للعنصر يشمل العلامات المميزة والحالة..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="min-h-[120px] text-right resize-none"
              />
            </div>

            {/* Distinguishing Marks */}
            <div className="space-y-2">
              <Label htmlFor="marks" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                علامات مميزة
                <span className="text-xs text-muted-foreground">(اختياري)</span>
              </Label>
              <Input
                id="marks"
                placeholder="مثال: خدش صغير على الزاوية"
                value={distinguishingMarks}
                onChange={(e) => setDistinguishingMarks(e.target.value)}
                className="text-right"
              />
            </div>

            {/* Images */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-primary" />
                الصور (حتى 5 صور)
              </Label>
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="images"
                  disabled={uploadedFiles.length >= 5}
                />
                <label htmlFor="images" className="cursor-pointer">
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    اضغط لرفع الصور أو اسحبها هنا
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG حتى 10MB
                  </p>
                </label>
              </div>

              {/* Uploaded Images Preview */}
              {previewUrls.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-3">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`صورة ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                المدينة
              </Label>
              <Select value={locationCity} onValueChange={setLocationCity}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المدينة" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  الموقع التقريبي
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMap(!showMap)}
                  className="gap-1 text-xs"
                >
                  <Map className="h-3 w-3" />
                  {showMap ? 'إخفاء الخريطة' : 'تحديد على الخريطة'}
                </Button>
              </Label>
              <Input
                id="location"
                placeholder="مثال: شارع التحرير، أمام الجامعة"
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
                required
                className="text-right"
              />

              {/* GPS Indicator */}
              {locationLat && locationLng && (
                <div className="text-xs text-success flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  تم تحديد الموقع: {locationLat.toFixed(4)}, {locationLng.toFixed(4)}
                </div>
              )}

              {/* Map */}
              {showMap && (
                <LocationPicker
                  initialLat={locationLat}
                  initialLng={locationLng}
                  onLocationSelect={(loc) => {
                    setLocationLat(loc.lat);
                    setLocationLng(loc.lng);
                    if (loc.address) {
                      setLocationAddress(loc.address);
                    }
                  }}
                />
              )}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                {reportType === 'lost' ? 'تاريخ الفقدان' : 'تاريخ العثور'}
              </Label>
              <Input
                id="date"
                type="date"
                value={dateOccurred}
                onChange={(e) => setDateOccurred(e.target.value)}
                required
                className="text-right"
              />
            </div>

            {/* AI Notice */}
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  تحليل بالذكاء الاصطناعي
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  سيتم تحليل بلاغك ومقارنته تلقائياً مع البلاغات الأخرى للعثور على
                  تطابقات محتملة
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="hero"
              size="xl"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  جاري إرسال البلاغ...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  تقديم البلاغ
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
