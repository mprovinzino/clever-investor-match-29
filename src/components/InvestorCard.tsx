import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, MapPin, Building, Users, Phone } from "lucide-react";

interface InvestorCardProps {
  investor: {
    id: string;
    company_name: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    status: string;
  };
  onViewProfile: (investor: any) => void;
  onEditInvestor: (investor: any) => void;
}

export const InvestorCard = ({ investor, onViewProfile, onEditInvestor }: InvestorCardProps) => {
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditInvestor(investor);
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewProfile(investor);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground text-lg leading-tight">
              {investor.company_name || "Unnamed Company"}
            </h3>
            <p className="text-muted-foreground text-sm">
              {investor.first_name} {investor.last_name}
            </p>
          </div>
          <Badge variant="secondary" className="ml-2">
            {investor.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground text-xs">{investor.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground text-xs">{investor.phone_number}</span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={handleViewClick}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Profile
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleEditClick}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};