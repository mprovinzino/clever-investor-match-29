
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Building, MapPin, DollarSign, FileText, Globe, Users, Target, TrendingUp, Map } from "lucide-react";
import CoverageMapbox from "./CoverageMapbox";

interface InvestorProfileModalProps {
  investor: any;
  isOpen: boolean;
  onClose: () => void;
  onEditInvestor: (investor: any) => void;
}

export const InvestorProfileModal = ({ investor, isOpen, onClose, onEditInvestor }: InvestorProfileModalProps) => {
  if (!investor) return null;

  const handleEditClick = () => {
    console.log("Edit button clicked in profile modal for investor:", investor);
    onEditInvestor(investor);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Building className="h-6 w-6" />
            {investor["Company Name"]}
            <Badge variant="secondary">Tier {investor.Tier}</Badge>
          </DialogTitle>
          <DialogDescription>
            View and manage investor profile and buy box criteria
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="buybox">Buy Box</TabsTrigger>
            <TabsTrigger value="markets">Markets</TabsTrigger>
            <TabsTrigger value="coverage">Coverage</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Main POC</label>
                    <p className="text-foreground">{investor["Main POC"] || "Not specified"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Company URL</label>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      {investor["HS Company URL"] ? (
                        <a 
                          href={investor["HS Company URL"]} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {investor["HS Company URL"]}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">Not provided</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Weekly Capacity</label>
                    <p className="text-foreground text-lg font-semibold">{investor["Weekly Cap"] || 0} deals</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Coverage Type</label>
                    <Badge variant="outline">{investor["Coverage Type"] || "Not specified"}</Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Direct Purchase</label>
                    <Badge variant={investor["Direct Purchase"] === "YES" ? "default" : "secondary"}>
                      {investor["Direct Purchase"] || "Not specified"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Investor Tags & Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                   <div>
                     <label className="text-sm font-medium text-muted-foreground">Tags</label>
                     <div className="flex flex-wrap gap-2 mt-1">
                        {investor["Investor Tags"] ? (
                          investor["Investor Tags"].split(",").map((tag: string, index: number) => (
                            <Badge key={`tag-${investor.ID}-${index}-${tag.trim()}`} variant="outline">{tag.trim()}</Badge>
                          ))
                        ) : (
                          <p className="text-muted-foreground text-sm">No tags specified</p>
                        )}
                     </div>
                   </div>
                   {investor["Notes"] && (
                     <div>
                       <label className="text-sm font-medium text-muted-foreground">Notes</label>
                       <p className="text-foreground bg-muted p-3 rounded text-sm whitespace-pre-wrap">
                         {investor["Notes"]}
                       </p>
                     </div>
                   )}
                   {investor["Reason for Freeze"] && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Freeze Reason</label>
                      <p className="text-foreground bg-muted p-2 rounded text-sm">
                        {investor["Reason for Freeze"]}
                      </p>
                    </div>
                  )}
                  {investor["Cold"] && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Cold Status</label>
                      <p className="text-foreground bg-muted p-2 rounded text-sm">
                        {investor["Cold"]}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="buybox" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Buy Box Criteria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Full Buy Box Details</label>
                  <p className="text-foreground bg-muted p-3 rounded mt-1">
                    {investor["Buy Box"] || "No buy box criteria specified"}
                  </p>
                </div>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Preferred Offer Types</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {investor["Offer Types"] ? (
                       investor["Offer Types"].split(",").map((type: string, index: number) => (
                         <Badge key={`offer-type-${investor.ID}-${index}-${type.trim()}`} variant="default">{type.trim()}</Badge>
                       ))
                    ) : (
                      <p className="text-muted-foreground text-sm">No offer types specified</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="markets" className="mt-4">
            <div className="grid grid-cols-1 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Primary Markets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground">
                    {investor["Primary Markets"] || "No primary markets specified"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    Secondary Markets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground">
                    {investor["Secondary Markets"] || "No secondary markets specified"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Target Zip Codes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-foreground">
                    {investor["Zip Codes"] ? (
                      <div className="flex flex-wrap gap-1">
                         {investor["Zip Codes"].split(',').map((zip: string, index: number) => (
                           <Badge key={`zip-${investor.ID}-${index}-${zip.trim()}`} variant="secondary" className="text-xs">
                             {zip.trim()}
                           </Badge>
                         ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No zip codes specified</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="coverage" className="mt-4">
            <CoverageMapbox investorId={investor.ID} editable={false} />
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Activity & Communications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Activity tracking coming soon</p>
                  <p className="text-sm">Contact history and deal activity will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleEditClick}>
            Edit Investor
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
