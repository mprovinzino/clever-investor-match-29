import React, { useRef, useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useMapboxContext } from './SafeMapboxProvider';
import StaticMapFallback from './StaticMapFallback';

interface BasicMapboxProps {
  height?: string;
  center?: [number, number];
  zoom?: number;
  onLoad?: (map: any) => void;
}

const BasicMapbox: React.FC<BasicMapboxProps> = ({
  height = '400px',
  center = [-74.0060, 40.7128], // NYC [lng, lat]
  zoom = 10,
  onLoad
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [error, setError] = useState<string>('');
  const [hasIncrementedUsage, setHasIncrementedUsage] = useState(false);
  
  const { token: mapboxToken, canLoadMap, incrementUsage, usagePercentage } = useMapboxContext();

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map.current || !canLoadMap) return;

    // Increment usage counter when map loads
    const loadMapWithUsageTracking = async () => {
      try {
        if (!hasIncrementedUsage) {
          await incrementUsage('map_load');
          setHasIncrementedUsage(true);
        }

        // Dynamically import mapbox to prevent React conflicts
        const mapboxgl = await import('mapbox-gl');
        await import('mapbox-gl/dist/mapbox-gl.css');
        
        mapboxgl.default.accessToken = mapboxToken;
      
        map.current = new mapboxgl.default.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/light-v11',
          center: center,
          zoom: zoom,
          // Add optimization settings for better performance
          maxZoom: 18,
          attributionControl: false,
          renderWorldCopies: false
        });

        map.current.addControl(new mapboxgl.default.NavigationControl(), 'top-right');

        // Wait for style to be fully loaded before calling onLoad
        map.current.on('styledata', () => {
          if (map.current && map.current.loaded() && map.current.isStyleLoaded() && onLoad) {
            console.log('BasicMapbox: Map style fully loaded, calling onLoad');
            onLoad(map.current);
          }
        });

        map.current.on('load', () => {
          console.log('BasicMapbox: Map load event fired');
          if (map.current && map.current.loaded() && onLoad) {
            onLoad(map.current);
          }
        });

        // Add usage tracking for interaction events
        map.current.on('moveend', () => {
          // Debounced - only track significant movements
        });

      } catch (error) {
        console.error('Failed to load Mapbox:', error);
        setError('Failed to load Mapbox. Please refresh the page.');
      }
    };

    loadMapWithUsageTracking();

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, center, zoom, onLoad, canLoadMap, incrementUsage, hasIncrementedUsage]);

  // Show static fallback if usage limit exceeded
  if (!canLoadMap) {
    return (
      <StaticMapFallback 
        height={height}
        message={`Map disabled - ${usagePercentage.toFixed(1)}% of monthly quota used`}
      />
    );
  }

  if (error) {
    return (
      <div style={{ height }} className="flex items-center justify-center bg-muted rounded-lg">
        <div className="max-w-md w-full p-4 space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height }} className="relative">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
    </div>
  );
};

export default BasicMapbox;