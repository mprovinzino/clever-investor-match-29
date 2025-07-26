
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, MapPin, Building, Users, StickyNote } from "lucide-react";

interface InvestorCardProps {
  investor: {
    ID: number;
    "Company Name": string;
    "Main POC": string;
    "Notes": string;
    Tier: number;
    "Weekly Cap": number;
    "Coverage Type": string;
    "Primary Markets": string;
    "Offer Types": string;
    "Investor Tags": string;
  };
  onViewProfile: (investor: any) => void;
  onEditInvestor: (investor: any) => void;
}

export const InvestorCard = ({ investor, onViewProfile, onEditInvestor }: InvestorCardProps) => {
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Edit button clicked for investor:", investor);
    onEditInvestor(investor);
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("View button clicked for investor:", investor);
    onViewProfile(investor);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground text-lg leading-tight">
              {investor["Company Name"] || "Unnamed Company"}
            </h3>
            <p className="text-muted-foreground text-sm">
              {investor["Main POC"] || "No Contact"}
            </p>
          </div>
          <Badge variant="secondary" className="ml-2">
            Tier {investor.Tier}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{investor["Coverage Type"] || "Not specified"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{investor["Weekly Cap"] || 0} deals/week</span>
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground text-xs">
              {investor["Primary Markets"] ? (
                investor["Primary Markets"].length > 40 
                  ? `${investor["Primary Markets"].substring(0, 40)}...`
                  : investor["Primary Markets"]
              ) : "No markets specified"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {investor["Offer Types"] ? (
            investor["Offer Types"].split(",").slice(0, 2).map((type: string, index: number) => (
              <Badge key={`offer-${investor.ID}-${index}`} variant="outline" className="text-xs">
                {type.trim()}
              </Badge>
            ))
          ) : (
            <Badge variant="outline" className="text-xs">No offer types</Badge>
          )}
          {investor["Offer Types"] && investor["Offer Types"].split(",").length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{investor["Offer Types"].split(",").length - 2} more
            </Badge>
          )}
        </div>

        {investor["Notes"] && (
          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
            <StickyNote className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">
              {investor["Notes"].length > 100 
                ? `${investor["Notes"].substring(0, 100)}...` 
                : investor["Notes"]
              }
            </span>
          </div>
        )}

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
