import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMapboxUsage } from '@/hooks/useMapboxUsage';

interface MapboxContextType {
  token: string | null;
  canLoadMap: boolean;
  incrementUsage: (type?: 'map_load' | 'geocoding') => Promise<void>;
  setToken: (token: string) => void;
  usagePercentage: number;
}

const MapboxContext = createContext<MapboxContextType | null>(null);

export const useMapboxContext = () => {
  const context = useContext(MapboxContext);
  if (!context) {
    throw new Error('useMapboxContext must be used within a SafeMapboxProvider');
  }
  return context;
};

interface SafeMapboxProviderProps {
  children: React.ReactNode;
}

export const SafeMapboxProvider: React.FC<SafeMapboxProviderProps> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const { usage, incrementUsage } = useMapboxUsage();

  useEffect(() => {
    // Initialize with the provided token
    const providedToken = 'pk.eyJ1IjoibWFwcm92aW56aW5vIiwiYSI6ImNtZGxhbG9qYjE3aDUyanBwNjAwODdsZTMifQ.rsrf3mpqDK8DEELbK3LSTg';
    setTokenState(providedToken);
    
    // Also check localStorage for any saved token (fallback)
    const savedToken = localStorage.getItem('mapbox_token');
    if (savedToken && !providedToken) {
      setTokenState(savedToken);
    }
  }, []);

  const setToken = (newToken: string) => {
    setTokenState(newToken);
    localStorage.setItem('mapbox_token', newToken);
  };

  const canLoadMap = usage?.canLoadMap ?? true;
  const usagePercentage = usage?.mapLoadsPercentage ?? 0;

  return (
    <MapboxContext.Provider
      value={{
        token,
        canLoadMap,
        incrementUsage,
        setToken,
        usagePercentage
      }}
    >
      {children}
    </MapboxContext.Provider>
  );
};