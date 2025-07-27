import React, { useEffect, useState } from 'react';
import { GeoJSON, Popup } from 'react-leaflet';
import BasicMap from './BasicMap';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CoverageMapProps {
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

const CoverageMap: React.FC<CoverageMapProps> = ({ investorId, editable = false }) => {
  const [coverageAreas, setCoverageAreas] = useState<CoverageArea[]>([]);
  const [loading, setLoading] = useState(true);
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
    // For now, we'll add a placeholder function
    // Drawing functionality will be implemented separately
    toast({
      title: "Drawing Feature",
      description: "Drawing tools will be available soon",
    });
  };

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
        <BasicMap height="500px">
          {coverageAreas.map((area) => (
            <GeoJSON
              key={area.id}
              data={area.geojson_data}
              style={{
                fillColor: '#3b82f6',
                weight: 2,
                opacity: 1,
                color: '#1d4ed8',
                fillOpacity: 0.3
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold">{area.area_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Created: {new Date(area.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Popup>
            </GeoJSON>
          ))}
        </BasicMap>
      </CardContent>
    </Card>
  );
};

export default CoverageMap;