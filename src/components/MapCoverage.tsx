import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Trash2, Edit3, Plus, MapPin } from 'lucide-react';
import MapContainer from '@/components/MapContainer';

interface CoverageArea {
  id: string;
  investor_id: number;
  area_name: string;
  geojson_data: any;
  area_type: string;
  created_at: string;
  updated_at: string;
}

interface MapCoverageProps {
  investorId: number;
  readonly?: boolean;
}

const MapCoverage: React.FC<MapCoverageProps> = ({ investorId, readonly = false }) => {
  const map = useRef<any>(null);
  const drawnItems = useRef<any>(null);
  const [drawControl, setDrawControl] = useState<any>(null);
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');
  const [pendingGeoJSON, setPendingGeoJSON] = useState<any>(null);
  const [selectedArea, setSelectedArea] = useState<CoverageArea | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editAreaName, setEditAreaName] = useState('');
  const [mapError, setMapError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Fetch coverage areas
  const { data: coverageAreas = [], isLoading } = useQuery({
    queryKey: ['coverage-areas', investorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coverage_areas')
        .select('*')
        .eq('investor_id', investorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CoverageArea[];
    },
  });

  // Create coverage area mutation
  const createAreaMutation = useMutation({
    mutationFn: async ({ areaName, geoJSON }: { areaName: string; geoJSON: any }) => {
        const { error } = await supabase
          .from('coverage_areas')
          .insert({
            investor_id: investorId,
            area_name: areaName,
            geojson_data: geoJSON,
            area_type: geoJSON.geometry?.type === 'Polygon' ? 'polygon' : 
                      geoJSON.geometry?.type === 'Circle' ? 'circle' : 'polygon'
          });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coverage-areas', investorId] });
      toast.success('Coverage area saved successfully');
      setIsNameDialogOpen(false);
      setNewAreaName('');
      setPendingGeoJSON(null);
    },
    onError: (error) => {
      toast.error('Failed to save coverage area');
      console.error('Error saving coverage area:', error);
    },
  });

  // Update coverage area mutation
  const updateAreaMutation = useMutation({
    mutationFn: async ({ id, areaName }: { id: string; areaName: string }) => {
      const { error } = await supabase
        .from('coverage_areas')
        .update({ area_name: areaName })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coverage-areas', investorId] });
      toast.success('Coverage area updated successfully');
      setIsEditDialogOpen(false);
      setSelectedArea(null);
      setEditAreaName('');
    },
    onError: (error) => {
      toast.error('Failed to update coverage area');
      console.error('Error updating coverage area:', error);
    },
  });

  // Delete coverage area mutation
  const deleteAreaMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('coverage_areas')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coverage-areas', investorId] });
      toast.success('Coverage area deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete coverage area');
      console.error('Error deleting coverage area:', error);
    },
  });

  const handleMapReady = (mapInstance: any, L: any) => {
    console.log('✅ Map ready for coverage areas');
    map.current = mapInstance;

    // Initialize drawn items layer
    drawnItems.current = new L.FeatureGroup();
    map.current.addLayer(drawnItems.current);

    if (!readonly) {
      try {
        // Add drawing controls
        const drawControlInstance = new L.Control.Draw({
          edit: {
            featureGroup: drawnItems.current,
            remove: true
          },
          draw: {
            polygon: true,
            circle: true,
            rectangle: true,
            marker: false,
            polyline: false,
            circlemarker: false
          }
        });
        map.current.addControl(drawControlInstance);
        setDrawControl(drawControlInstance);

        // Handle draw events
        map.current.on(L.Draw.Event.CREATED, (event: any) => {
          const layer = event.layer;
          const geoJSON = layer.toGeoJSON();
          
          setPendingGeoJSON(geoJSON);
          setIsNameDialogOpen(true);
        });

        console.log('Drawing controls added successfully');
      } catch (error) {
        console.error('Error setting up drawing controls:', error);
        setMapError('Failed to setup drawing controls');
      }
    }

    // Load existing coverage areas
    loadCoverageAreas(L);
  };

  const handleMapError = (error: Error) => {
    console.error('Map error:', error);
    setMapError(error.message);
  };

  const loadCoverageAreas = (L: any) => {
    if (!map.current || !drawnItems.current) return;

    try {
      // Clear existing layers
      drawnItems.current.clearLayers();

      // Add each coverage area to the map
      coverageAreas.forEach((area) => {
        try {
          const layer = L.geoJSON(area.geojson_data, {
            style: {
              color: '#3b82f6',
              weight: 2,
              opacity: 0.8,
              fillOpacity: 0.2
            }
          });

          layer.bindPopup(`
            <div class="p-2">
              <h3 class="font-semibold">${area.area_name}</h3>
              <p class="text-sm text-gray-600">Type: ${area.area_type}</p>
              <p class="text-sm text-gray-600">Created: ${new Date(area.created_at).toLocaleDateString()}</p>
            </div>
          `);

          drawnItems.current.addLayer(layer);
        } catch (error) {
          console.error('Error adding coverage area to map:', error);
        }
      });

      // Fit map to show all coverage areas
      if (drawnItems.current.getLayers().length > 0) {
        map.current.fitBounds(drawnItems.current.getBounds(), { padding: [20, 20] });
      }
    } catch (error) {
      console.error('Error loading coverage areas:', error);
    }
  };

  // Update coverage areas when data changes
  useEffect(() => {
    if (map.current && drawnItems.current && (window as any).L) {
      loadCoverageAreas((window as any).L);
    }
  }, [coverageAreas]);

  const handleSaveArea = () => {
    if (!newAreaName.trim()) {
      toast.error('Please enter a name for the coverage area');
      return;
    }

    createAreaMutation.mutate({
      areaName: newAreaName.trim(),
      geoJSON: pendingGeoJSON
    });
  };

  const handleEditArea = (area: CoverageArea) => {
    setSelectedArea(area);
    setEditAreaName(area.area_name);
    setIsEditDialogOpen(true);
  };

  const handleUpdateArea = () => {
    if (!selectedArea || !editAreaName.trim()) {
      toast.error('Please enter a valid name');
      return;
    }

    updateAreaMutation.mutate({
      id: selectedArea.id,
      areaName: editAreaName.trim()
    });
  };

  const handleDeleteArea = (area: CoverageArea) => {
    if (confirm(`Are you sure you want to delete "${area.area_name}"?`)) {
      deleteAreaMutation.mutate(area.id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Coverage Areas
          </CardTitle>
          <CardDescription>Loading coverage areas...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-muted animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Coverage Areas
          </CardTitle>
          <CardDescription>
            {readonly 
              ? 'View coverage areas for this investor'
              : 'Draw and manage coverage areas. Use the drawing tools to create polygons, circles, or rectangles.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MapContainer
            onMapReady={handleMapReady}
            onMapError={handleMapError}
            className="h-96 w-full rounded-lg border"
            style={{ minHeight: '400px' }}
          />
          {mapError && (
            <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
              Map Error: {mapError}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Coverage Areas List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Coverage Areas ({coverageAreas.length})
            {!readonly && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Plus className="h-3 w-3" />
                Use map tools to add
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {coverageAreas.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No coverage areas defined yet. {!readonly && 'Use the drawing tools above to create coverage areas.'}
            </p>
          ) : (
            <div className="space-y-2">
              {coverageAreas.map((area) => (
                <div key={area.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{area.area_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {area.area_type} • Created {new Date(area.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {!readonly && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditArea(area)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteArea(area)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Name Dialog */}
      <Dialog open={isNameDialogOpen} onOpenChange={setIsNameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Name Your Coverage Area</DialogTitle>
            <DialogDescription>
              Enter a name for this coverage area to help identify it later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="area-name">Area Name</Label>
              <Input
                id="area-name"
                value={newAreaName}
                onChange={(e) => setNewAreaName(e.target.value)}
                placeholder="e.g., Downtown Austin, North Dallas"
                onKeyDown={(e) => e.key === 'Enter' && handleSaveArea()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveArea} disabled={createAreaMutation.isPending}>
              {createAreaMutation.isPending ? 'Saving...' : 'Save Area'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Coverage Area</DialogTitle>
            <DialogDescription>
              Update the name of this coverage area.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-area-name">Area Name</Label>
              <Input
                id="edit-area-name"
                value={editAreaName}
                onChange={(e) => setEditAreaName(e.target.value)}
                placeholder="e.g., Downtown Austin, North Dallas"
                onKeyDown={(e) => e.key === 'Enter' && handleUpdateArea()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateArea} disabled={updateAreaMutation.isPending}>
              {updateAreaMutation.isPending ? 'Updating...' : 'Update Area'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MapCoverage;