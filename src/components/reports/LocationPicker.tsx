import { useState, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Search, Loader2, Check, Target } from 'lucide-react';
import { toast } from 'sonner';

interface LocationPickerProps {
    onLocationSelect: (location: {
        lat: number;
        lng: number;
        address?: string;
    }) => void;
    initialLat?: number;
    initialLng?: number;
}

// إحداثيات المدن اليمنية
const YEMEN_CITIES: Record<string, { lat: number; lng: number }> = {
    'صنعاء': { lat: 15.3694, lng: 44.1910 },
    'عدن': { lat: 12.7855, lng: 45.0187 },
    'تعز': { lat: 13.5789, lng: 44.0219 },
    'الحديدة': { lat: 14.7979, lng: 42.9540 },
    'إب': { lat: 13.9759, lng: 44.1709 },
    'المكلا': { lat: 14.5422, lng: 49.1255 },
    'ذمار': { lat: 14.5425, lng: 44.4019 },
    'عمران': { lat: 15.6594, lng: 43.9439 },
    'صعدة': { lat: 16.9400, lng: 43.7600 },
    'حجة': { lat: 15.6914, lng: 43.6031 },
    'البيضاء': { lat: 13.9870, lng: 45.5700 },
    'لحج': { lat: 13.0570, lng: 44.8871 },
    'مأرب': { lat: 15.4681, lng: 45.3220 },
    'شبوة': { lat: 14.7722, lng: 47.0122 },
};

export function LocationPicker({ onLocationSelect, initialLat, initialLng }: LocationPickerProps) {
    const [lat, setLat] = useState<number>(initialLat || 15.3694);
    const [lng, setLng] = useState<number>(initialLng || 44.1910);
    const [zoom, setZoom] = useState(15);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const mapRef = useRef<HTMLIFrameElement>(null);

    // فلترة المدن
    const filteredCities = Object.keys(YEMEN_CITIES).filter(city =>
        city.includes(searchQuery)
    );

    // الحصول على الموقع الحالي بـ GPS
    const getCurrentLocation = useCallback(() => {
        if (!navigator.geolocation) {
            toast.error('المتصفح لا يدعم تحديد الموقع');
            return;
        }

        setIsLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const newLat = position.coords.latitude;
                const newLng = position.coords.longitude;
                setLat(newLat);
                setLng(newLng);
                setZoom(17);
                setIsConfirmed(false);
                toast.success('تم تحديد موقعك الحالي');
                setIsLoading(false);
            },
            (error) => {
                let errorMsg = 'فشل في تحديد الموقع';
                if (error.code === 1) errorMsg = 'يرجى السماح بالوصول للموقع';
                else if (error.code === 2) errorMsg = 'الموقع غير متاح';
                toast.error(errorMsg);
                setIsLoading(false);
            },
            { enableHighAccuracy: true, timeout: 15000 }
        );
    }, []);

    // اختيار مدينة
    const selectCity = (cityName: string) => {
        const city = YEMEN_CITIES[cityName];
        if (city) {
            setLat(city.lat);
            setLng(city.lng);
            setZoom(14);
            setSearchQuery(cityName);
            setShowSuggestions(false);
            setIsConfirmed(false);
        }
    };

    // تأكيد الموقع
    const confirmLocation = () => {
        onLocationSelect({ lat, lng, address: searchQuery || undefined });
        setIsConfirmed(true);
        toast.success('تم تأكيد الموقع');
    };

    // تقريب/إبعاد الخريطة
    const zoomIn = () => setZoom(prev => Math.min(prev + 1, 19));
    const zoomOut = () => setZoom(prev => Math.max(prev - 1, 5));

    // تحريك الموقع بالأسهم
    const moveLocation = (direction: 'up' | 'down' | 'left' | 'right') => {
        const step = 0.001 / (zoom / 15); // خطوة أصغر مع تكبير أكثر
        setIsConfirmed(false);
        switch (direction) {
            case 'up': setLat(prev => prev + step); break;
            case 'down': setLat(prev => prev - step); break;
            case 'left': setLng(prev => prev - step); break;
            case 'right': setLng(prev => prev + step); break;
        }
    };

    // رابط الخريطة
    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.008},${lng + 0.01},${lat + 0.008}&layer=mapnik&marker=${lat},${lng}`;

    return (
        <Card className="overflow-hidden border-2 border-primary/20">
            <CardContent className="p-0">
                {/* البحث */}
                <div className="p-3 border-b bg-muted/30">
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="ابحث عن مدينة..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                className="pr-10"
                            />

                            {showSuggestions && filteredCities.length > 0 && (
                                <div className="absolute top-full right-0 left-0 z-50 mt-1 bg-background border rounded-lg shadow-lg max-h-40 overflow-auto">
                                    {filteredCities.map(city => (
                                        <button
                                            key={city}
                                            onClick={() => selectCity(city)}
                                            className="w-full px-3 py-2 text-right text-sm hover:bg-primary/10 flex items-center gap-2"
                                        >
                                            <MapPin className="h-4 w-4 text-primary" />
                                            {city}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={getCurrentLocation}
                            disabled={isLoading}
                            title="موقعي الحالي"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Navigation className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* الخريطة */}
                <div className="relative h-56 bg-muted">
                    <iframe
                        ref={mapRef}
                        title="خريطة"
                        src={mapUrl}
                        className="w-full h-full border-0"
                        loading="lazy"
                    />

                    {/* الدبوس في المنتصف */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="relative">
                            <Target className={`h-8 w-8 ${isConfirmed ? 'text-success' : 'text-destructive'}`} />
                        </div>
                    </div>
                </div>

                {/* الإحداثيات والتأكيد */}
                <div className="p-3 border-t bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">
                            {lat.toFixed(5)}, {lng.toFixed(5)}
                        </span>
                        {isConfirmed && (
                            <Badge variant="success" className="gap-1 text-xs">
                                <Check className="h-3 w-3" />
                                تم التأكيد
                            </Badge>
                        )}
                    </div>

                    <Button
                        onClick={confirmLocation}
                        className={`w-full gap-2 ${isConfirmed ? 'bg-success hover:bg-success/90' : ''}`}
                        size="sm"
                    >
                        {isConfirmed ? (
                            <>
                                <Check className="h-4 w-4" />
                                تم تأكيد الموقع
                            </>
                        ) : (
                            <>
                                <MapPin className="h-4 w-4" />
                                تأكيد الموقع
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
