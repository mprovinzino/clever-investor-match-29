import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MapPin, Building } from 'lucide-react';
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

interface Investor {
  ID: number;
  "Company Name": string;
}

const GlobalCoverageMap: React.FC = () => {
  const map = useRef<any>(null);
  const coverageLayersGroup = useRef<any>(null);
  const [selectedInvestor, setSelectedInvestor] = useState<string>('all');
  const [mapError, setMapError] = useState<string | null>(null);

  // Fetch all investors
  const { data: investors = [] } = useQuery({
    queryKey: ['investors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Investor Network')
        .select('ID, "Company Name"')
        .order('"Company Name"');

      if (error) throw error;
      return data as Investor[];
    },
  });

  // Fetch all coverage areas
  const { data: coverageAreas = [], isLoading } = useQuery({
    queryKey: ['all-coverage-areas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coverage_areas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CoverageArea[];
    },
  });

  // Fetch company names separately
  const { data: investorNames = {} } = useQuery({
    queryKey: ['investor-names'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Investor Network')
        .select('ID, "Company Name"');

      if (error) throw error;
      return data.reduce((acc: any, inv: any) => {
        acc[inv.ID] = inv["Company Name"];
        return acc;
      }, {});
    },
  });

  const handleMapReady = (mapInstance: any, L: any) => {
    console.log('✅ Global map ready');
    map.current = mapInstance;

    // Initialize coverage layers group
    coverageLayersGroup.current = new L.LayerGroup();
    map.current.addLayer(coverageLayersGroup.current);

    // Load coverage areas
    loadCoverageAreas(L);
  };

  const handleMapError = (error: Error) => {
    console.error('Global map error:', error);
    setMapError(error.message);
  };

  const loadCoverageAreas = (L: any) => {
    if (!map.current || !coverageLayersGroup.current || !coverageAreas.length) return;

    try {
      // Clear existing layers
      coverageLayersGroup.current.clearLayers();

      // Filter areas based on selected investor
      const filteredAreas = selectedInvestor === 'all' 
        ? coverageAreas 
        : coverageAreas.filter(area => area.investor_id.toString() === selectedInvestor);

      // Color palette for different investors
      const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

      // Add each coverage area to the map
      filteredAreas.forEach((area, index) => {
        try {
          const color = colors[area.investor_id % colors.length];
          
          const layer = L.geoJSON(area.geojson_data, {
            style: {
              color: color,
              weight: 2,
              opacity: 0.8,
              fillOpacity: 0.2
            }
          });

          layer.bindPopup(`
            <div class="p-2">
              <h3 class="font-semibold">${area.area_name}</h3>
              <p class="text-sm text-gray-600">Investor: ${investorNames[area.investor_id] || 'Unknown'}</p>
              <p class="text-sm text-gray-600">Type: ${area.area_type}</p>
              <p class="text-sm text-gray-600">Created: ${new Date(area.created_at).toLocaleDateString()}</p>
            </div>
          `);

          coverageLayersGroup.current.addLayer(layer);
        } catch (error) {
          console.error('Error adding coverage area to global map:', error);
        }
      });

      // Fit map to show all coverage areas
      if (coverageLayersGroup.current.getLayers().length > 0) {
        try {
          map.current.fitBounds(coverageLayersGroup.current.getBounds(), { padding: [20, 20] });
        } catch (error) {
          console.error('Error fitting bounds:', error);
        }
      }
    } catch (error) {
      console.error('Error loading coverage areas:', error);
    }
  };

  // Update coverage areas when data or filter changes
  useEffect(() => {
    if (map.current && coverageLayersGroup.current && (window as any).L) {
      loadCoverageAreas((window as any).L);
    }
  }, [coverageAreas, selectedInvestor, investorNames]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Global Coverage Map
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Global Coverage Map
        </CardTitle>
        <CardDescription>
          View coverage areas from all investors on one interactive map
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <label className="text-sm font-medium">Filter by Investor:</label>
          </div>
          <Select value={selectedInvestor} onValueChange={setSelectedInvestor}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select an investor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Investors ({coverageAreas.length} areas)</SelectItem>
              {investors.map((investor) => {
                const areaCount = coverageAreas.filter(area => area.investor_id === investor.ID).length;
                return (
                  <SelectItem key={investor.ID} value={investor.ID.toString()}>
                    {investor["Company Name"]} ({areaCount} areas)
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        
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
        
        {coverageAreas.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No coverage areas defined yet. Create coverage areas in the investor profiles to see them here.
          </p>
        ) : (
          <div className="text-sm text-muted-foreground">
            Showing {selectedInvestor === 'all' ? coverageAreas.length : coverageAreas.filter(area => area.investor_id.toString() === selectedInvestor).length} coverage areas
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GlobalCoverageMap;