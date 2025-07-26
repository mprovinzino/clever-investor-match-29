import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Eye, MessageSquare, Phone, Mail, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const MatchesTable = () => {
  const { data: matches, isLoading, error } = useQuery({
    queryKey: ["matches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches" as any)
        .select(`
          *,
          properties (
            address,
            city,
            state,
            list_price,
            property_type
          ),
          investors_new (
            company_name,
            main_poc
          )
        `)
        .order("match_score", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Matches...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Matches</CardTitle>
          <CardDescription>
            {error instanceof Error ? error.message : "Failed to load match data"}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-warning/10 text-warning border-warning/20";
      case "contacted":
        return "bg-primary/10 text-primary border-primary/20";
      case "interested":
        return "bg-success/10 text-success border-success/20";
      case "under_contract":
        return "bg-accent/10 text-accent border-accent/20";
      case "closed":
        return "bg-success text-success-foreground";
      case "not_interested":
      case "rejected":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-2 w-2 bg-accent rounded-full"></div>
          Property-Investor Matches ({matches?.length || 0})
        </CardTitle>
        <CardDescription>
          AI-powered matching results with scoring and communication tracking
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!matches || matches.length === 0 ? (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <div className="text-muted-foreground text-lg mb-4">No matches found</div>
            <p className="text-sm text-muted-foreground mb-6">
              Matches will appear automatically when you add properties that match investor criteria
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline">
                Add Property
              </Button>
              <Button variant="outline">
                Add Investor
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Investor</TableHead>
                  <TableHead>Match Score</TableHead>
                  <TableHead>Criteria Match</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price Info</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.map((match: any) => (
                  <TableRow key={match.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">
                          {match.properties?.address}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {match.properties?.city}, {match.properties?.state}
                        </div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {match.properties?.property_type?.replace('_', ' ')}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">
                          {match.investors_new?.company_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {match.investors_new?.main_poc}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className={`text-lg font-bold ${getScoreColor(match.match_score || 0)}`}>
                          {match.match_score || 0}%
                        </div>
                        <Progress 
                          value={match.match_score || 0} 
                          className="w-20 h-2"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex gap-1">
                          <Badge 
                            variant={match.price_match ? "default" : "secondary"}
                            className={match.price_match ? "bg-success/10 text-success" : ""}
                          >
                            Price
                          </Badge>
                          <Badge 
                            variant={match.location_match ? "default" : "secondary"}
                            className={match.location_match ? "bg-success/10 text-success" : ""}
                          >
                            Location
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Badge 
                            variant={match.property_type_match ? "default" : "secondary"}
                            className={match.property_type_match ? "bg-success/10 text-success" : ""}
                          >
                            Type
                          </Badge>
                          <Badge 
                            variant={match.strategy_match ? "default" : "secondary"}
                            className={match.strategy_match ? "bg-success/10 text-success" : ""}
                          >
                            Strategy
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(match.status)}>
                        {match.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {match.contacted_at && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Contacted {new Date(match.contacted_at).toLocaleDateString()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {match.properties?.list_price && (
                          <div className="text-sm font-medium">
                            List: ${match.properties.list_price.toLocaleString()}
                          </div>
                        )}
                        {match.offered_price && (
                          <div className="text-sm text-muted-foreground">
                            Offered: ${match.offered_price.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {new Date(match.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchesTable;