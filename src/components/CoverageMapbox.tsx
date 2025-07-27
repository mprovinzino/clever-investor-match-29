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
    
    // Add coverage areas to the map
    coverageAreas.forEach((area, index) => {
      const sourceId = `coverage-source-${area.id}`;
      const fillLayerId = `coverage-fill-${area.id}`;
      const lineLayerId = `coverage-line-${area.id}`;

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
    });
  };

  // Update map when coverage areas change
  useEffect(() => {
    if (mapRef.current && !loading) {
      // Remove existing layers and sources
      const map = mapRef.current;
      const style = map.getStyle();
      
      if (style.layers) {
        style.layers.forEach((layer: any) => {
          if (layer.id.startsWith('coverage-')) {
            map.removeLayer(layer.id);
          }
        });
      }

      if (style.sources) {
        Object.keys(style.sources).forEach((sourceId) => {
          if (sourceId.startsWith('coverage-source-')) {
            map.removeSource(sourceId);
          }
        });
      }

      // Add new layers
      handleMapLoad(map);
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