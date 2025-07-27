import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, AlertCircle } from 'lucide-react';

interface CoveragePlaceholderProps {
  title?: string;
  description?: string;
}

const CoveragePlaceholder: React.FC<CoveragePlaceholderProps> = ({
  title = "Coverage Map",
  description = "Interactive map functionality will be available here"
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-96 bg-muted/30 rounded-lg border-2 border-dashed">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            Map Coming Soon
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Coverage area mapping functionality is being rebuilt and will be available shortly.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CoveragePlaceholder;