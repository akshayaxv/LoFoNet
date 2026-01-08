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

// Indian cities coordinates
const INDIAN_CITIES: Record<string, { lat: number; lng: number }> = {
    'Mumbai': { lat: 19.0760, lng: 72.8777 },
    'Delhi': { lat: 28.7041, lng: 77.1025 },
    'Bangalore': { lat: 12.9716, lng: 77.5946 },
    'Hyderabad': { lat: 17.3850, lng: 78.4867 },
    'Chennai': { lat: 13.0827, lng: 80.2707 },
    'Kolkata': { lat: 22.5726, lng: 88.3639 },
    'Pune': { lat: 18.5204, lng: 73.8567 },
    'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
    'Jaipur': { lat: 26.9124, lng: 75.7873 },
    'Surat': { lat: 21.1702, lng: 72.8311 },
    'Lucknow': { lat: 26.8467, lng: 80.9462 },
    'Kanpur': { lat: 26.4499, lng: 80.3319 },
    'Nagpur': { lat: 21.1458, lng: 79.0882 },
    'Indore': { lat: 22.7196, lng: 75.8577 },
    'Thane': { lat: 19.2183, lng: 72.9781 },
    'Bhopal': { lat: 23.2599, lng: 77.4126 },
    'Visakhapatnam': { lat: 17.6868, lng: 83.2185 },
    'Patna': { lat: 25.5941, lng: 85.1376 },
    'Vadodara': { lat: 22.3072, lng: 73.1812 },
    'Ghaziabad': { lat: 28.6692, lng: 77.4538 },
    'Ludhiana': { lat: 30.9010, lng: 75.8573 },
    'Agra': { lat: 27.1767, lng: 78.0081 },
    'Nashik': { lat: 19.9975, lng: 73.7898 },
    'Faridabad': { lat: 28.4089, lng: 77.3178 },
    'Meerut': { lat: 28.9845, lng: 77.7064 },
    'Rajkot': { lat: 22.3039, lng: 70.8022 },
    'Varanasi': { lat: 25.3176, lng: 82.9739 },
    'Srinagar': { lat: 34.0837, lng: 74.7973 },
    'Amritsar': { lat: 31.6340, lng: 74.8723 },
    'Coimbatore': { lat: 11.0168, lng: 76.9558 },
};

export function LocationPicker({ onLocationSelect, initialLat, initialLng }: LocationPickerProps) {
    const [lat, setLat] = useState<number>(initialLat || 28.7041);
    const [lng, setLng] = useState<number>(initialLng || 77.1025);
    const [zoom, setZoom] = useState(15);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const mapRef = useRef<HTMLIFrameElement>(null);

    // Filter cities
    const filteredCities = Object.keys(INDIAN_CITIES).filter(city =>
        city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Get current GPS location
    const getCurrentLocation = useCallback(() => {
        if (!navigator.geolocation) {
            toast.error('Browser does not support location services');
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
                toast.success('Current location detected');
                setIsLoading(false);
            },
            (error) => {
                let errorMsg = 'Failed to detect location';
                if (error.code === 1) errorMsg = 'Please allow location access';
                else if (error.code === 2) errorMsg = 'Location unavailable';
                toast.error(errorMsg);
                setIsLoading(false);
            },
            { enableHighAccuracy: true, timeout: 15000 }
        );
    }, []);

    // Select city
    const selectCity = (cityName: string) => {
        const city = INDIAN_CITIES[cityName];
        if (city) {
            setLat(city.lat);
            setLng(city.lng);
            setZoom(14);
            setSearchQuery(cityName);
            setShowSuggestions(false);
            setIsConfirmed(false);
        }
    };

    // Confirm location
    const confirmLocation = () => {
        onLocationSelect({ lat, lng, address: searchQuery || undefined });
        setIsConfirmed(true);
        toast.success('Location confirmed');
    };

    // Zoom in/out map
    const zoomIn = () => setZoom(prev => Math.min(prev + 1, 19));
    const zoomOut = () => setZoom(prev => Math.max(prev - 1, 5));

    // Move location with arrows
    const moveLocation = (direction: 'up' | 'down' | 'left' | 'right') => {
        const step = 0.001 / (zoom / 15); // Smaller step with more zoom
        setIsConfirmed(false);
        switch (direction) {
            case 'up': setLat(prev => prev + step); break;
            case 'down': setLat(prev => prev - step); break;
            case 'left': setLng(prev => prev - step); break;
            case 'right': setLng(prev => prev + step); break;
        }
    };

    // Map URL
    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.008},${lng + 0.01},${lat + 0.008}&layer=mapnik&marker=${lat},${lng}`;

    return (
        <Card className="overflow-hidden border-2 border-primary/20">
            <CardContent className="p-0">
                {/* Search */}
                <div className="p-3 border-b bg-muted/30">
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search for a city..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                className="pl-10"
                            />

                            {showSuggestions && filteredCities.length > 0 && (
                                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-lg shadow-lg max-h-40 overflow-auto">
                                    {filteredCities.map(city => (
                                        <button
                                            key={city}
                                            onClick={() => selectCity(city)}
                                            className="w-full px-3 py-2 text-left text-sm hover:bg-primary/10 flex items-center gap-2"
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
                            title="My current location"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Navigation className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Map */}
                <div className="relative h-56 bg-muted">
                    <iframe
                        ref={mapRef}
                        title="Map"
                        src={mapUrl}
                        className="w-full h-full border-0"
                        loading="lazy"
                    />

                    {/* Pin in center */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="relative">
                            <Target className={`h-8 w-8 ${isConfirmed ? 'text-success' : 'text-destructive'}`} />
                        </div>
                    </div>
                </div>

                {/* Coordinates and confirmation */}
                <div className="p-3 border-t bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">
                            {lat.toFixed(5)}, {lng.toFixed(5)}
                        </span>
                        {isConfirmed && (
                            <Badge variant="success" className="gap-1 text-xs">
                                <Check className="h-3 w-3" />
                                Confirmed
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
                                Location Confirmed
                            </>
                        ) : (
                            <>
                                <MapPin className="h-4 w-4" />
                                Confirm Location
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}