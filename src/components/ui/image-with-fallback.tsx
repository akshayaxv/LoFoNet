import { useState, useEffect } from 'react';
import { ImageOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallbackSrc?: string;
    showIconOnFallback?: boolean;
}

export function ImageWithFallback({
    src,
    alt,
    className,
    fallbackSrc,
    showIconOnFallback = true,
    ...props
}: ImageWithFallbackProps) {
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setError(false);
        setLoading(true);
    }, [src]);

    const handleLoad = () => {
        setLoading(false);
    };

    const handleError = () => {
        setError(true);
        setLoading(false);
    };

    if (error || !src) {
        return (
            <div
                className={cn(
                    "flex items-center justify-center bg-muted/50 text-muted-foreground",
                    className
                )}
            >
                {fallbackSrc ? (
                    <img
                        src={fallbackSrc}
                        alt={alt}
                        className={cn("w-full h-full object-cover", className)}
                    />
                ) : (
                    showIconOnFallback && <ImageOff className="h-8 w-8 opacity-50" />
                )}
            </div>
        );
    }

    return (
        <div className={cn("relative overflow-hidden", className)}>
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/20 backdrop-blur-sm z-10">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            )}
            <img
                src={src}
                alt={alt}
                className={cn("w-full h-full object-cover transition-opacity duration-300", loading ? "opacity-0" : "opacity-100")}
                onLoad={handleLoad}
                onError={handleError}
                {...props}
            />
        </div>
    );
}
