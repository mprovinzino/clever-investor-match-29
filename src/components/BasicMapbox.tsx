import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface BasicMapboxProps {
  height?: string;
  center?: [number, number];
  zoom?: number;
  onLoad?: (map: mapboxgl.Map) => void;
}

const BasicMapbox: React.FC<BasicMapboxProps> = ({
  height = '400px',
  center = [-74.0060, 40.7128], // NYC [lng, lat]
  zoom = 10,
  onLoad
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Try to get Mapbox token from localStorage first (temporary fallback)
    const savedToken = localStorage.getItem('mapbox_token');
    if (savedToken) {
      setMapboxToken(savedToken);
    } else {
      setError('Mapbox token not found. Please add your Mapbox token.');
    }
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map.current) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: center,
      zoom: zoom
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      if (map.current && onLoad) {
        onLoad(map.current);
      }
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, center, zoom, onLoad]);

  const handleTokenSubmit = (token: string) => {
    localStorage.setItem('mapbox_token', token);
    setMapboxToken(token);
    setError('');
  };

  if (error || !mapboxToken) {
    return (
      <div style={{ height }} className="flex items-center justify-center bg-muted rounded-lg">
        <div className="max-w-md w-full p-4 space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Mapbox token required. Get yours at{' '}
              <a 
                href="https://mapbox.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                mapbox.com
              </a>
            </AlertDescription>
          </Alert>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter your Mapbox token"
              className="flex-1 px-3 py-2 border border-input rounded-md text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleTokenSubmit(e.currentTarget.value);
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                handleTokenSubmit(input.value);
              }}
              className="px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
            >
              Set Token
            </button>
          </div>
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