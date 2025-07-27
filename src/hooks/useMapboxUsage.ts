import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UsageData {
  map_loads: number;
  geocoding_requests: number;
  last_reset: string;
  created_at: string;
  updated_at: string;
}

interface UsageStats {
  mapLoads: number;
  geocodingRequests: number;
  mapLoadsPercentage: number;
  geocodingPercentage: number;
  daysUntilReset: number;
  canLoadMap: boolean;
}

const FREE_TIER_LIMITS = {
  MAP_LOADS: 50000,
  GEOCODING: 100000
};

const WARNING_THRESHOLDS = {
  HIGH: 0.8, // 80%
  CRITICAL: 0.95 // 95%
};

export const useMapboxUsage = () => {
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const getCurrentMonthKey = () => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  const getDaysUntilReset = () => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const diffTime = nextMonth.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const loadUsage = async () => {
    try {
      const monthKey = getCurrentMonthKey();
      const storageKey = `mapbox_usage_${monthKey}`;
      
      const savedUsage = localStorage.getItem(storageKey);
      const usageData = savedUsage ? JSON.parse(savedUsage) : {
        map_loads: 0,
        geocoding_requests: 0,
        last_reset: new Date().toISOString()
      };

      const mapLoadsPercentage = (usageData.map_loads / FREE_TIER_LIMITS.MAP_LOADS) * 100;
      const geocodingPercentage = (usageData.geocoding_requests / FREE_TIER_LIMITS.GEOCODING) * 100;

      setUsage({
        mapLoads: usageData.map_loads,
        geocodingRequests: usageData.geocoding_requests,
        mapLoadsPercentage,
        geocodingPercentage,
        daysUntilReset: getDaysUntilReset(),
        canLoadMap: mapLoadsPercentage < 100
      });

      // Show warnings at thresholds
      if (mapLoadsPercentage >= WARNING_THRESHOLDS.CRITICAL * 100) {
        toast({
          title: "⚠️ Critical: Mapbox Usage Limit",
          description: `${mapLoadsPercentage.toFixed(1)}% of monthly map loads used. Consider switching to static maps.`,
          variant: "destructive"
        });
      } else if (mapLoadsPercentage >= WARNING_THRESHOLDS.HIGH * 100) {
        toast({
          title: "⚠️ Warning: High Mapbox Usage",
          description: `${mapLoadsPercentage.toFixed(1)}% of monthly map loads used. Approaching limit.`,
        });
      }

    } catch (error) {
      console.error('Error loading Mapbox usage:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementUsage = async (type: 'map_load' | 'geocoding' = 'map_load') => {
    try {
      const monthKey = getCurrentMonthKey();
      const storageKey = `mapbox_usage_${monthKey}`;
      
      const savedUsage = localStorage.getItem(storageKey);
      const currentUsage = savedUsage ? JSON.parse(savedUsage) : {
        map_loads: 0,
        geocoding_requests: 0,
        last_reset: new Date().toISOString()
      };

      const updatedUsage = {
        ...currentUsage,
        [type === 'map_load' ? 'map_loads' : 'geocoding_requests']: 
          currentUsage[type === 'map_load' ? 'map_loads' : 'geocoding_requests'] + 1,
        updated_at: new Date().toISOString()
      };

      localStorage.setItem(storageKey, JSON.stringify(updatedUsage));

      // Reload usage after increment
      await loadUsage();

    } catch (error) {
      console.error('Error incrementing Mapbox usage:', error);
    }
  };

  useEffect(() => {
    loadUsage();
  }, []);

  return {
    usage,
    loading,
    incrementUsage,
    refreshUsage: loadUsage
  };
};