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
  { value: 'electronics', label: 'Electronics' },
  { value: 'documents', label: 'Documents' },
  { value: 'jewelry', label: 'Jewelry' },
  { value: 'bags', label: 'Bags & Wallets' },
  { value: 'keys', label: 'Keys' },
  { value: 'pets', label: 'Pets' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'other', label: 'Other' },
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

  // Check notification status on load
  useEffect(() => {
    setNotificationsEnabled(hasUserAcceptedNotifications());
    setShowNotificationPrompt(shouldAskForNotifications());
  }, []);

  // Request notification permission
  const handleEnableNotifications = async () => {
    const permission = await requestNotificationPermission();
    setNotificationsEnabled(permission === 'granted');
    setShowNotificationPrompt(false);
    if (permission === 'granted') {
      toast.success('Notifications enabled successfully!');
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
      toast.error('Please enter report title');
      return false;
    }
    if (!category) {
      toast.error('Please select item type');
      return false;
    }
    if (!description.trim()) {
      toast.error('Please enter detailed description');
      return false;
    }
    if (!locationAddress.trim()) {
      toast.error('Please enter location');
      return false;
    }
    if (!locationCity) {
      toast.error('Please select city');
      return false;
    }
    if (!dateOccurred) {
      toast.error('Please select date');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!user) {
      toast.error('Please login first');
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
        toast.success('Report submitted successfully!', {
          description: 'We will analyze your report and compare it with other reports',
        });
        navigate('/reports');
      } else {
        toast.error(result.error || 'An error occurred while submitting the report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto pb-20 md:pb-0">
      <Card className="border-0 shadow-none md:border md:shadow-sm bg-transparent md:bg-card">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">Submit New Report</CardTitle>
          <CardDescription>
            Enter item details accurately to increase matching chances
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Notification Permission Alert */}
          {showNotificationPrompt && (
            <Alert className="mb-6 border-primary/30 bg-primary/5">
              <Bell className="h-4 w-4 text-primary" />
              <AlertDescription className="flex items-center justify-between">
                <span>
                  Enable notifications to receive alerts when a match is found for your report
                </span>
                <Button
                  size="sm"
                  onClick={handleEnableNotifications}
                  className="ml-4"
                >
                  Enable
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {notificationsEnabled && (
            <div className="mb-4 text-xs text-success flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Notifications enabled - You'll receive alerts when a match is found
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
              I Lost Something
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
              I Found Something
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                Report Title
              </Label>
              <Input
                id="title"
                placeholder="Example: iPhone 14 Pro"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Item Type
              </Label>
              <Select value={category} onValueChange={(v) => setCategory(v as ItemCategory)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select item type" />
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
                Color
              </Label>
              <Input
                id="color"
                placeholder="Example: Dark blue"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Detailed Description
              </Label>
              <Textarea
                id="description"
                placeholder="Write a detailed description of the item including distinguishing marks and condition..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="min-h-[120px] resize-none"
              />
            </div>

            {/* Distinguishing Marks */}
            <div className="space-y-2">
              <Label htmlFor="marks" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Distinguishing Marks
                <span className="text-xs text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="marks"
                placeholder="Example: Small scratch on corner"
                value={distinguishingMarks}
                onChange={(e) => setDistinguishingMarks(e.target.value)}
              />
            </div>

            {/* Images */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-primary" />
                Images (up to 5 images)
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
                    Click to upload images or drag them here
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG up to 10MB
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
                        alt={`Image ${index + 1}`}
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
                City
              </Label>
              <Select value={locationCity} onValueChange={setLocationCity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
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
                  Approximate Location
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMap(!showMap)}
                  className="gap-1 text-xs"
                >
                  <Map className="h-3 w-3" />
                  {showMap ? 'Hide Map' : 'Select on Map'}
                </Button>
              </Label>
              <Input
                id="location"
                placeholder="Example: Main Street, near University"
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
                required
              />

              {/* GPS Indicator */}
              {locationLat && locationLng && (
                <div className="text-xs text-success flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Location selected: {locationLat.toFixed(4)}, {locationLng.toFixed(4)}
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
                {reportType === 'lost' ? 'Date Lost' : 'Date Found'}
              </Label>
              <Input
                id="date"
                type="date"
                value={dateOccurred}
                onChange={(e) => setDateOccurred(e.target.value)}
                required
              />
            </div>

            {/* AI Notice */}
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  AI Analysis
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your report will be automatically analyzed and compared with other reports to find potential matches
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
                  Submitting Report...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Submit Report
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}