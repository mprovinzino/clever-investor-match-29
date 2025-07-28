import React, { useEffect, useState, useRef } from 'react';
import BasicMapbox from './BasicMapbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CoverageMapboxProps {
  investorId: number;
  editable?: boolean;
}

interface CoverageArea {
  id: string;
  investor_id: number;
  area_name: string;
  geojson_data: any;
  created_at: string;
  updated_at: string;
}

const CoverageMapbox: React.FC<CoverageMapboxProps> = ({ investorId, editable = false }) => {
  const [coverageAreas, setCoverageAreas] = useState<CoverageArea[]>([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCoverageAreas();
  }, [investorId]);

  const loadCoverageAreas = async () => {
    try {
      const { data, error } = await supabase
        .from('coverage_areas')
        .select('*')
        .eq('investor_id', investorId);

      if (error) {
        throw error;
      }

      setCoverageAreas(data || []);
    } catch (error) {
      console.error('Error loading coverage areas:', error);
      toast({
        title: "Error",
        description: "Failed to load coverage areas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateArea = () => {
    toast({
      title: "Drawing Feature",
      description: "Drawing tools will be available soon",
    });
  };

  const handleMapLoad = (map: any) => {
    mapRef.current = map;
    addCoverageLayersToMap(map);
  };

  const addCoverageLayersToMap = (map: any) => {
    console.log('CoverageMapbox: addCoverageLayersToMap called', { 
      map, 
      mapLoaded: map?.loaded(), 
      coverageAreasLength: coverageAreas.length 
    });
    
    // Simplified safety checks
    if (!map || !map.loaded()) {
      console.log('CoverageMapbox: Map not ready, skipping layer addition');
      return;
    }
    
    // First, clean up any existing layers and sources
    cleanupMapSources(map);
    
    if (coverageAreas.length === 0) {
      console.log('CoverageMapbox: No coverage areas to display');
      return;
    }
    
    const bounds = new (window as any).mapboxgl.LngLatBounds();
    let boundsSet = false;
    
    // Add coverage areas to the map
    coverageAreas.forEach((area) => {
      // Validate GeoJSON data
      if (!area.geojson_data || !area.geojson_data.type) {
        console.warn('CoverageMapbox: Invalid GeoJSON data for area:', area.area_name);
        return;
      }
      
      const sourceId = `coverage-source-${area.id}`;
      const fillLayerId = `coverage-fill-${area.id}`;
      const lineLayerId = `coverage-line-${area.id}`;

      try {
        // Add source
        map.addSource(sourceId, {
          type: 'geojson',
          data: area.geojson_data
        });

        // Add fill layer
        map.addLayer({
          id: fillLayerId,
          type: 'fill',
          source: sourceId,
          paint: {
            'fill-color': '#3b82f6',
            'fill-opacity': 0.3
          }
        });

        // Add line layer
        map.addLayer({
          id: lineLayerId,
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': '#1d4ed8',
            'line-width': 2,
            'line-opacity': 1
          }
        });

        // Extend bounds with this area's coordinates
        if (area.geojson_data.type === 'FeatureCollection') {
          area.geojson_data.features.forEach((feature: any) => {
            if (feature.geometry && feature.geometry.coordinates) {
              const coords = feature.geometry.coordinates;
              if (feature.geometry.type === 'Polygon') {
                coords[0].forEach((coord: [number, number]) => {
                  bounds.extend(coord);
                  boundsSet = true;
                });
              }
            }
          });
        } else if (area.geojson_data.geometry && area.geojson_data.geometry.coordinates) {
          const coords = area.geojson_data.geometry.coordinates;
          if (area.geojson_data.geometry.type === 'Polygon') {
            coords[0].forEach((coord: [number, number]) => {
              bounds.extend(coord);
              boundsSet = true;
            });
          }
        }

        // Add click handler
        map.on('click', fillLayerId, (e: any) => {
          import('mapbox-gl').then((mapboxgl) => {
            new mapboxgl.default.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
              <div class="p-3 min-w-48">
                <h3 class="font-semibold text-sm mb-2">${area.area_name}</h3>
                <p class="text-xs text-muted-foreground">
                  Created: ${new Date(area.created_at).toLocaleDateString()}
                </p>
              </div>
            `)
              .addTo(map);
          });
        });

        // Change cursor on hover
        map.on('mouseenter', fillLayerId, () => {
          map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', fillLayerId, () => {
          map.getCanvas().style.cursor = '';
        });
        
      } catch (error) {
        console.error('CoverageMapbox: Error adding coverage area to map:', error, area);
      }
    });
    
    // Fit map to show all coverage areas
    if (boundsSet) {
      setTimeout(() => {
        try {
          map.fitBounds(bounds, { 
            padding: { top: 50, bottom: 50, left: 50, right: 50 },
            maxZoom: 12 
          });
        } catch (error) {
          console.error('CoverageMapbox: Error fitting bounds:', error);
        }
      }, 100);
    }
  };

  const cleanupMapSources = (map: any) => {
    if (!map || !map.loaded()) {
      return;
    }
    
    try {
      const layers = map.getStyle()?.layers || [];
      const sources = map.getStyle()?.sources || {};
      
      // Remove existing layers first
      layers.forEach((layer: any) => {
        if (layer.id.startsWith('coverage-')) {
          try {
            map.removeLayer(layer.id);
          } catch (e) {
            // Layer might not exist, ignore error
          }
        }
      });

      // Remove existing sources
      Object.keys(sources).forEach((sourceId) => {
        if (sourceId.startsWith('coverage-source-')) {
          try {
            map.removeSource(sourceId);
          } catch (e) {
            // Source might not exist, ignore error
          }
        }
      });
    } catch (error) {
      console.error('CoverageMapbox: Error during cleanup:', error);
    }
  };

  // Update map when coverage areas change
  useEffect(() => {
    console.log('CoverageMapbox: useEffect triggered', { 
      mapRef: mapRef.current, 
      loading, 
      coverageAreasLength: coverageAreas.length,
      mapLoaded: mapRef.current?.loaded()
    });
    
    if (mapRef.current && !loading && mapRef.current.loaded()) {
      addCoverageLayersToMap(mapRef.current);
    } else {
      console.log('CoverageMapbox: Skipping layer addition - conditions not met');
    }
  }, [coverageAreas, loading]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">Loading coverage areas...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Coverage Areas
          {editable && (
            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCreateArea}>
                <Edit3 className="h-4 w-4 mr-1" />
                Add Area
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <BasicMapbox 
          height="500px"
          onLoad={handleMapLoad}
        />
      </CardContent>
    </Card>
  );
};

export default CoverageMapbox;