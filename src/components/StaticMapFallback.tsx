import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StaticMapFallbackProps {
  height?: string;
  message?: string;
}

const StaticMapFallback: React.FC<StaticMapFallbackProps> = ({ 
  height = '400px',
  message = "Interactive map disabled to prevent usage overage" 
}) => {
  return (
    <div style={{ height }} className="flex flex-col items-center justify-center bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/20">
      <div className="max-w-md w-full p-6 space-y-4 text-center">
        <div className="flex justify-center">
          <div className="p-3 bg-muted rounded-full">
            <MapPin className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {message}
          </AlertDescription>
        </Alert>

        <div className="text-sm text-muted-foreground space-y-2">
          <p>Map functionality is temporarily limited to preserve your free tier quota.</p>
          <p>Usage will reset at the beginning of next month.</p>
        </div>

        {/* Static placeholder visualization */}
        <div className="mt-4 p-4 bg-background rounded-lg border">
          <div className="grid grid-cols-3 gap-2 opacity-50">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-8 bg-muted rounded animate-pulse" />
            ))}
          </div>
          <div className="text-xs text-center mt-2 text-muted-foreground">
            Static Map Preview
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaticMapFallback;