import React, { useEffect, useState, useRef } from 'react';
import BasicMapbox from './BasicMapbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Edit3, Trash2, PenTool, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MapboxDraw from '@mapbox/mapbox-gl-draw';

interface CoverageMapboxProps {
  investorId: string;
  editable?: boolean;
}

interface CoverageArea {
  id: string;
  investor_id: string;
  area_name: string;
  geojson_data: any;
  created_at: string;
  updated_at: string;
}

const CoverageMapbox: React.FC<CoverageMapboxProps> = ({ investorId, editable = false }) => {
  const [coverageAreas, setCoverageAreas] = useState<CoverageArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [areaName, setAreaName] = useState('');
  const [drawnFeature, setDrawnFeature] = useState<any>(null);
  const mapRef = useRef<any>(null);
  const drawRef = useRef<any>(null);
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
    if (!mapRef.current || !drawRef.current) return;
    
    setIsDrawing(true);
    drawRef.current.changeMode('draw_polygon');
    
    toast({
      title: "Drawing Mode",
      description: "Click on the map to start drawing your coverage area",
    });
  };

  const handleCancelDrawing = () => {
    if (!drawRef.current) return;
    
    setIsDrawing(false);
    drawRef.current.deleteAll();
    drawRef.current.changeMode('simple_select');
  };

  const handleSaveArea = async () => {
    if (!drawnFeature || !areaName.trim()) {
      toast({
        title: "Error",
        description: "Please provide an area name",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('coverage_areas')
        .insert({
          investor_id: investorId,
          area_name: areaName.trim(),
          geojson_data: drawnFeature
        })
        .select()
        .single();

      if (error) throw error;

      setCoverageAreas([...coverageAreas, data]);
      setShowSaveDialog(false);
      setAreaName('');
      setDrawnFeature(null);
      setIsDrawing(false);
      
      if (drawRef.current) {
        drawRef.current.deleteAll();
        drawRef.current.changeMode('simple_select');
      }

      toast({
        title: "Success",
        description: "Coverage area saved successfully",
      });
    } catch (error) {
      console.error('Error saving coverage area:', error);
      toast({
        title: "Error",
        description: "Failed to save coverage area",
        variant: "destructive"
      });
    }
  };

  const handleDeleteArea = async (areaId: string) => {
    try {
      const { error } = await supabase
        .from('coverage_areas')
        .delete()
        .eq('id', areaId);

      if (error) throw error;

      setCoverageAreas(coverageAreas.filter(area => area.id !== areaId));
      
      toast({
        title: "Success",
        description: "Coverage area deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting coverage area:', error);
      toast({
        title: "Error",
        description: "Failed to delete coverage area",
        variant: "destructive"
      });
    }
  };

  const handleMapLoad = (map: any) => {
    mapRef.current = map;
    
    // Initialize Mapbox Draw
    if (editable) {
      const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {},
        styles: [
          // Style for polygons being drawn
          {
            'id': 'gl-draw-polygon-fill-inactive',
            'type': 'fill',
            'filter': ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
            'paint': {
              'fill-color': '#3b82f6',
              'fill-outline-color': '#1d4ed8',
              'fill-opacity': 0.3
            }
          },
          {
            'id': 'gl-draw-polygon-fill-active',
            'type': 'fill',
            'filter': ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
            'paint': {
              'fill-color': '#ef4444',
              'fill-outline-color': '#dc2626',
              'fill-opacity': 0.3
            }
          },
          {
            'id': 'gl-draw-polygon-stroke-inactive',
            'type': 'line',
            'filter': ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
            'paint': {
              'line-color': '#1d4ed8',
              'line-width': 2
            }
          },
          {
            'id': 'gl-draw-polygon-stroke-active',
            'type': 'line',
            'filter': ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
            'paint': {
              'line-color': '#dc2626',
              'line-width': 2
            }
          },
          // Style for polygon vertices
          {
            'id': 'gl-draw-polygon-and-line-vertex-halo-active',
            'type': 'circle',
            'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
            'paint': {
              'circle-radius': 5,
              'circle-color': '#ffffff'
            }
          },
          {
            'id': 'gl-draw-polygon-and-line-vertex-active',
            'type': 'circle',
            'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
            'paint': {
              'circle-radius': 3,
              'circle-color': '#dc2626'
            }
          }
        ]
      });
      
      map.addControl(draw);
      drawRef.current = draw;
      
      // Listen for drawing completion
      map.on('draw.create', (e: any) => {
        const feature = e.features[0];
        setDrawnFeature(feature);
        setShowSaveDialog(true);
      });
      
      // Listen for drawing updates
      map.on('draw.update', (e: any) => {
        const feature = e.features[0];
        setDrawnFeature(feature);
      });
    }
    
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
            const popup = new mapboxgl.default.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
              <div class="p-3 min-w-48">
                <h3 class="font-semibold text-sm mb-2">${area.area_name}</h3>
                <p class="text-xs text-muted-foreground mb-2">
                  Created: ${new Date(area.created_at).toLocaleDateString()}
                </p>
                ${editable ? `
                  <button onclick="window.deleteArea?.('${area.id}')" 
                          class="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
                    Delete Area
                  </button>
                ` : ''}
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

  // Set up global delete function for popup
  useEffect(() => {
    if (editable) {
      (window as any).deleteArea = handleDeleteArea;
      return () => {
        delete (window as any).deleteArea;
      };
    }
  }, [handleDeleteArea, editable]);

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
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Coverage Areas
            {editable && (
              <div className="ml-auto flex gap-2">
                {isDrawing ? (
                  <>
                    <Button variant="outline" size="sm" onClick={handleCancelDrawing}>
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" onClick={handleCreateArea}>
                    <PenTool className="h-4 w-4 mr-1" />
                    Draw Area
                  </Button>
                )}
              </div>
            )}
          </CardTitle>
          {isDrawing && (
            <div className="text-sm text-muted-foreground">
              Click on the map to start drawing your coverage area. Complete the polygon by clicking on the first point.
            </div>
          )}
        </CardHeader>
        <CardContent>
          <BasicMapbox 
            height="500px"
            onLoad={handleMapLoad}
          />
          {coverageAreas.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              {coverageAreas.length} coverage area{coverageAreas.length !== 1 ? 's' : ''} defined
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Coverage Area</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Area Name</label>
              <Input
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                placeholder="Enter a name for this coverage area"
                className="mt-1"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => {
                setShowSaveDialog(false);
                handleCancelDrawing();
              }}>
                Cancel
              </Button>
              <Button onClick={handleSaveArea} disabled={!areaName.trim()}>
                <Save className="h-4 w-4 mr-1" />
                Save Area
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CoverageMapbox;