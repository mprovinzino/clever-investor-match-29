import React, { useRef, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, MapPin } from 'lucide-react';
import { loadLeaflet } from '@/lib/leafletLoader';

interface MapContainerProps {
  children?: React.ReactNode;
  onMapReady?: (map: any, L: any) => void;
  onMapError?: (error: Error) => void;
  className?: string;
  center?: [number, number];
  zoom?: number;
  style?: React.CSSProperties;
}

const MapContainer: React.FC<MapContainerProps> = ({
  children,
  onMapReady,
  onMapError,
  className = "h-96 w-full rounded-lg border",
  center = [39.8283, -98.5795],
  zoom = 4,
  style = { minHeight: '400px' }
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeMap = async () => {
      if (!mapRef.current || mapInstance.current) return;

      try {
        setIsLoading(true);
        setError(null);
        
        console.log('🗺️ Initializing map...');
        const { L } = await loadLeaflet();
        
        if (!mapRef.current) {
          console.warn('Map ref no longer available');
          return;
        }
        
        const map = L.map(mapRef.current, {
          center,
          zoom,
          zoomControl: true,
          attributionControl: true
        });
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);
        
        mapInstance.current = map;
        
        // Small delay to ensure map is fully rendered
        setTimeout(() => {
          map.invalidateSize();
          if (onMapReady) {
            onMapReady(map, L);
          }
          setIsLoading(false);
          console.log('✅ Map initialized successfully');
        }, 100);
        
      } catch (error) {
        console.error('❌ Map initialization failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setError(errorMessage);
        setIsLoading(false);
        
        if (onMapError) {
          onMapError(error instanceof Error ? error : new Error(errorMessage));
        }
        
        toast.error(`Map failed to load: ${errorMessage}`);
      }
    };

    initializeMap();
    
    return () => {
      if (mapInstance.current) {
        console.log('🧹 Cleaning up map instance');
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [center, zoom, onMapReady, onMapError]);


  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    window.location.reload();
  };

  if (error) {
    return (
      <div className={className} style={style}>
        <div className="flex flex-col items-center justify-center h-full bg-muted/50 rounded-lg">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Map Failed to Load</h3>
          <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
            {error}
          </p>
          <div className="flex gap-2">
            <Button onClick={handleRetry} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={className} style={style}>
        <div className="flex flex-col items-center justify-center h-full bg-muted/50 rounded-lg">
          <MapPin className="h-12 w-12 text-primary mb-4 animate-pulse" />
          <h3 className="text-lg font-semibold mb-2">Loading Map...</h3>
          <p className="text-sm text-muted-foreground">
            Initializing map resources and components
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      <div ref={mapRef} className="h-full w-full" />
      {children}
    </div>
  );
};

export default MapContainer;