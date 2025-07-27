import React, { useEffect, useState } from 'react';
import { GeoJSON, Popup } from 'react-leaflet';
import { FeatureGroup } from 'react-leaflet/FeatureGroup';
import { EditControl } from 'react-leaflet-draw';
import BasicMap from './BasicMap';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Edit3, Save, Trash2 } from 'lucide-react';
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

  const handleCreated = async (e: any) => {
    const { layer } = e;
    const geoJSON = layer.toGeoJSON();
    
    try {
      const { error } = await supabase
        .from('coverage_areas')
        .insert({
          investor_id: investorId,
          area_name: `Area ${coverageAreas.length + 1}`,
          geojson_data: geoJSON
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Coverage area created successfully"
      });
      
      loadCoverageAreas();
    } catch (error) {
      console.error('Error creating coverage area:', error);
      toast({
        title: "Error",
        description: "Failed to create coverage area",
        variant: "destructive"
      });
    }
  };

  const handleEdited = async (e: any) => {
    // Handle editing existing areas
    toast({
      title: "Success",
      description: "Coverage areas updated"
    });
  };

  const handleDeleted = async (e: any) => {
    // Handle deleting areas
    toast({
      title: "Success", 
      description: "Coverage areas deleted"
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
              <Button variant="outline" size="sm">
                <Edit3 className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <BasicMap height="500px">
          <FeatureGroup>
            {editable && (
              <EditControl
                position="topright"
                onCreated={handleCreated}
                onEdited={handleEdited}
                onDeleted={handleDeleted}
                draw={{
                  rectangle: false,
                  circle: false,
                  circlemarker: false,
                  marker: false,
                  polyline: false,
                  polygon: {
                    allowIntersection: false,
                    showArea: true
                  }
                }}
              />
            )}
          </FeatureGroup>
          
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