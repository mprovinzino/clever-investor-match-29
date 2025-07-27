import React, { useRef, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, MapPin } from 'lucide-react';
import { L } from '@/lib/leaflet';

interface MapContainerProps {
  children?: React.ReactNode;
  onMapReady?: (map: L.Map, L: typeof import('leaflet')) => void;
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
  const mapInstance = useRef<L.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let mounted = true;

    const initMap = () => {
      if (!mounted || !mapRef.current || mapInstance.current) return;
      
      try {
        console.log('🗺️ Initializing Leaflet map...');
        
        // Ensure the container has dimensions
        const container = mapRef.current;
        if (!container.offsetWidth || !container.offsetHeight) {
          console.warn('Map container has no dimensions, retrying...');
          setTimeout(() => mounted && initMap(), 100);
          return;
        }

        // Create map instance
        const map = L.map(container, {
          center: center,
          zoom: zoom,
          zoomControl: true,
          attributionControl: true
        });

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        mapInstance.current = map;
        
        console.log('✅ Map initialized successfully');
        
        // Trigger ready callback
        if (onMapReady) {
          onMapReady(map, L);
        }
        
        setIsLoading(false);
        setError(null);
        
      } catch (error) {
        console.error('❌ Map initialization failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize map';
        
        if (mounted) {
          setError(errorMessage);
          setIsLoading(false);
          
          if (onMapError) {
            onMapError(error instanceof Error ? error : new Error(errorMessage));
          }
          
          toast.error(`Map failed to load: ${errorMessage}`);
        }
      }
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(initMap, 50);
    
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      
      if (mapInstance.current) {
        console.log('🧹 Cleaning up map instance');
        try {
          mapInstance.current.remove();
        } catch (cleanupError) {
          console.warn('Error during map cleanup:', cleanupError);
        }
        mapInstance.current = null;
      }
    };
  }, [center, zoom, onMapReady, onMapError, retryKey]);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    setRetryKey(prev => prev + 1);
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
            Initializing map components
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      <div 
        ref={mapRef} 
        className="h-full w-full rounded-lg overflow-hidden"
        style={{ minHeight: '400px' }}
      />
      {children}
    </div>
  );
};

export default MapContainer;