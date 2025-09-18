import React, { useEffect, useState, useRef } from 'react';
import BasicMapbox from './BasicMapbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Users, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CoverageArea {
  id: string;
  investor_id: string;
  area_name: string;
  geojson_data: any;
  created_at: string;
  updated_at: string;
}

interface Investor {
  id: string;
  company_name: string;
  first_name: string;
  last_name: string;
}

const GlobalCoverageMapbox: React.FC = () => {
  const [coverageAreas, setCoverageAreas] = useState<CoverageArea[]>([]);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [selectedInvestor, setSelectedInvestor] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<any>(null);
  const { toast } = useToast();

  // Color palette for different investors
  const colors = [
    '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6',
    '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6366f1'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load coverage areas
      const { data: coverageData, error: coverageError } = await supabase
        .from('coverage_areas')
        .select('*');

      if (coverageError) {
        throw coverageError;
      }

      // Load investors
      const { data: investorData, error: investorError } = await supabase
        .from('investors')
        .select('id, company_name, first_name, last_name');

      if (investorError) {
        throw investorError;
      }

      setCoverageAreas(coverageData || []);
      setInvestors(investorData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load coverage data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAreas = selectedInvestor === 'all' 
    ? coverageAreas 
    : coverageAreas.filter(area => area.investor_id === selectedInvestor);

  const getInvestorColor = (investorId: string) => {
    const index = investors.findIndex(inv => inv.id === investorId);
    return colors[index % colors.length];
  };

  const getInvestorName = (investorId: string) => {
    const investor = investors.find(inv => inv.id === investorId);
    return investor ? investor.company_name : 'Unknown Investor';
  };

  const handleMapLoad = (map: any) => {
    mapRef.current = map;
    addCoverageLayersToMap(map);
  };

  const addCoverageLayersToMap = (map: any) => {
    console.log('addCoverageLayersToMap called', { 
      map, 
      mapLoaded: map?.loaded(), 
      filteredAreasLength: filteredAreas.length 
    });
    
    // Simplified safety checks
    if (!map || !map.loaded()) {
      console.log('Map not ready, skipping layer addition');
      return;
    }
    
    // First, clean up any existing layers and sources
    cleanupMapSources(map);
    
    if (filteredAreas.length === 0) {
      console.log('No coverage areas to display');
      return;
    }
    
    const bounds = new (window as any).mapboxgl.LngLatBounds();
    let boundsSet = false;
    
    // Add filtered coverage areas to the map
    filteredAreas.forEach((area) => {
      // Validate GeoJSON data
      if (!area.geojson_data || !area.geojson_data.type) {
        console.warn('Invalid GeoJSON data for area:', area.area_name);
        return;
      }
      
      const sourceId = `global-coverage-source-${area.id}`;
      const fillLayerId = `global-coverage-fill-${area.id}`;
      const lineLayerId = `global-coverage-line-${area.id}`;
      const color = getInvestorColor(area.investor_id);

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
            'fill-color': color,
            'fill-opacity': 0.3
          }
        });

        // Add line layer
        map.addLayer({
          id: lineLayerId,
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': color,
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
                <p class="text-sm font-medium mb-1">
                  Investor: ${getInvestorName(area.investor_id)}
                </p>
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
        console.error('Error adding coverage area to map:', error, area);
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
          console.error('Error fitting bounds:', error);
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
        if (layer.id.startsWith('global-coverage-')) {
          try {
            map.removeLayer(layer.id);
          } catch (e) {
            // Layer might not exist, ignore error
          }
        }
      });

      // Remove existing sources
      Object.keys(sources).forEach((sourceId) => {
        if (sourceId.startsWith('global-coverage-source-')) {
          try {
            map.removeSource(sourceId);
          } catch (e) {
            // Source might not exist, ignore error
          }
        }
      });
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  };

  // Update map when filter changes
  useEffect(() => {
    console.log('useEffect triggered', { 
      mapRef: mapRef.current, 
      loading, 
      filteredAreasLength: filteredAreas.length,
      mapLoaded: mapRef.current?.loaded()
    });
    
    if (mapRef.current && !loading && mapRef.current.loaded()) {
      addCoverageLayersToMap(mapRef.current);
    } else {
      console.log('Skipping layer addition - conditions not met');
    }
  }, [filteredAreas, loading]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">Loading global coverage map...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Global Coverage Map
          <div className="ml-auto flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Select value={selectedInvestor} onValueChange={setSelectedInvestor}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by investor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Investors</SelectItem>
                {investors.map((investor) => (
                  <SelectItem key={investor.id} value={investor.id}>
                    {investor.company_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          Showing {filteredAreas.length} coverage areas
          {selectedInvestor !== 'all' && (
            <span>for {getInvestorName(selectedInvestor)}</span>
          )}
        </div>
        
        <BasicMapbox 
          height="600px"
          onLoad={handleMapLoad}
        />
      </CardContent>
    </Card>
  );
};

export default GlobalCoverageMapbox;