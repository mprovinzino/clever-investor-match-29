import React, { useEffect, useState } from 'react';
import { GeoJSON, Popup } from 'react-leaflet';
import BasicMap from './BasicMap';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Users, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CoverageArea {
  id: string;
  investor_id: number;
  area_name: string;
  geojson_data: any;
  created_at: string;
  updated_at: string;
}

interface Investor {
  ID: number;
  "Company Name": string;
  Tier: number;
}

const GlobalCoverageMap: React.FC = () => {
  const [coverageAreas, setCoverageAreas] = useState<CoverageArea[]>([]);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [selectedInvestor, setSelectedInvestor] = useState<string>('all');
  const [loading, setLoading] = useState(true);
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
        .from('Investor Network')
        .select('ID, "Company Name", Tier');

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
    : coverageAreas.filter(area => area.investor_id.toString() === selectedInvestor);

  const getInvestorColor = (investorId: number) => {
    const index = investors.findIndex(inv => inv.ID === investorId);
    return colors[index % colors.length];
  };

  const getInvestorName = (investorId: number) => {
    const investor = investors.find(inv => inv.ID === investorId);
    return investor ? investor['Company Name'] : 'Unknown Investor';
  };

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
                  <SelectItem key={investor.ID} value={investor.ID.toString()}>
                    {investor['Company Name']}
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
            <span>for {getInvestorName(parseInt(selectedInvestor))}</span>
          )}
        </div>
        
        <BasicMap height="600px">
          {filteredAreas.map((area) => (
            <GeoJSON
              key={area.id}
              data={area.geojson_data}
              style={{
                fillColor: getInvestorColor(area.investor_id),
                weight: 2,
                opacity: 1,
                color: getInvestorColor(area.investor_id),
                fillOpacity: 0.3
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold">{area.area_name}</h3>
                  <p className="text-sm font-medium">
                    {getInvestorName(area.investor_id)}
                  </p>
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

export default GlobalCoverageMap;