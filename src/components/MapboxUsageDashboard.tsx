import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Activity, Calendar, MapPin, Search } from 'lucide-react';
import { useMapboxUsage } from '@/hooks/useMapboxUsage';

const MapboxUsageDashboard: React.FC = () => {
  const { usage, loading } = useMapboxUsage();

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Loading usage data...</div>
        </CardContent>
      </Card>
    );
  }

  if (!usage) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">No usage data available</div>
        </CardContent>
      </Card>
    );
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 95) return 'destructive';
    if (percentage >= 80) return 'secondary';
    return 'default';
  };

  const getUsageStatus = (percentage: number) => {
    if (percentage >= 95) return 'Critical';
    if (percentage >= 80) return 'Warning';
    return 'Normal';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Mapbox Usage Monitor
          <Badge variant={getUsageColor(usage.mapLoadsPercentage)} className="ml-auto">
            {getUsageStatus(usage.mapLoadsPercentage)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Map Loads Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">Map Loads</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {usage.mapLoads.toLocaleString()} / 50,000
            </span>
          </div>
          <Progress 
            value={usage.mapLoadsPercentage} 
            className="h-2"
          />
          <div className="text-xs text-muted-foreground">
            {usage.mapLoadsPercentage.toFixed(1)}% used this month
          </div>
        </div>

        {/* Geocoding Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span className="font-medium">Geocoding Requests</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {usage.geocodingRequests.toLocaleString()} / 100,000
            </span>
          </div>
          <Progress 
            value={usage.geocodingPercentage} 
            className="h-2"
          />
          <div className="text-xs text-muted-foreground">
            {usage.geocodingPercentage.toFixed(1)}% used this month
          </div>
        </div>

        {/* Reset Information */}
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <Calendar className="h-4 w-4" />
          <span className="text-sm">
            Usage resets in {usage.daysUntilReset} days
          </span>
        </div>

        {/* Warning Messages */}
        {usage.mapLoadsPercentage >= 95 && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive font-medium">
              Critical: Map loading is disabled to prevent overage charges.
            </p>
            <p className="text-xs text-destructive/80 mt-1">
              Static map fallbacks are being used instead.
            </p>
          </div>
        )}

        {usage.mapLoadsPercentage >= 80 && usage.mapLoadsPercentage < 95 && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-700 font-medium">
              Warning: Approaching monthly map load limit.
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              Consider using cached maps or static alternatives.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MapboxUsageDashboard;