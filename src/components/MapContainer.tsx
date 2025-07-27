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
    let retryCount = 0;
    const maxRetries = 10;

    const initMap = () => {
      console.log(`🗺️ [Attempt ${retryCount + 1}] Starting map initialization...`);
      
      if (!mounted) {
        console.log('❌ Component unmounted, aborting');
        return;
      }
      
      if (mapInstance.current) {
        console.log('✅ Map already exists, skipping');
        return;
      }
      
      if (!mapRef.current) {
        console.log('❌ Map container ref not available');
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(() => mounted && initMap(), 100);
        } else {
          setError('Map container not found after maximum retries');
          setIsLoading(false);
        }
        return;
      }

      console.log('🔍 Checking Leaflet availability...', { L: typeof L, Lmap: typeof L?.map });
      
      if (typeof L === 'undefined' || !L.map) {
        console.error('❌ Leaflet not available');
        setError('Leaflet library not loaded');
        setIsLoading(false);
        return;
      }
      
      // Check container dimensions
      const container = mapRef.current;
      const rect = container.getBoundingClientRect();
      console.log('📐 Container dimensions:', {
        offsetWidth: container.offsetWidth,
        offsetHeight: container.offsetHeight,
        clientWidth: container.clientWidth,
        clientHeight: container.clientHeight,
        rect: { width: rect.width, height: rect.height }
      });
      
      if (!container.offsetWidth || !container.offsetHeight) {
        console.warn('⚠️ Container has no dimensions, retrying...');
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(() => mounted && initMap(), 100);
        } else {
          setError('Map container failed to get dimensions');
          setIsLoading(false);
        }
        return;
      }

      try {
        console.log('🗺️ Creating Leaflet map instance...');
        
        // Create map instance
        const map = L.map(container, {
          center: center,
          zoom: zoom,
          zoomControl: true,
          attributionControl: true
        });

        console.log('🌍 Adding tile layer...');
        
        // Add tile layer with error handling
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        });
        
        tileLayer.on('tileerror', (e) => {
          console.warn('⚠️ Tile loading error:', e);
        });
        
        tileLayer.addTo(map);
        
        mapInstance.current = map;
        
        console.log('✅ Map initialized successfully');
        
        // Trigger ready callback
        if (onMapReady) {
          try {
            onMapReady(map, L);
            console.log('✅ Map ready callback executed');
          } catch (callbackError) {
            console.error('❌ Map ready callback failed:', callbackError);
          }
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

    // Add a longer delay to ensure CSS is loaded
    const timeoutId = setTimeout(initMap, 200);
    
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
        style={{ 
          minHeight: '400px',
          height: '100%',
          width: '100%',
          position: 'relative'
        }}
      />
      {children}
    </div>
  );
};

export default MapContainer;