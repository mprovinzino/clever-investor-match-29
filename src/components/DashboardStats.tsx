import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Building2, Target, TrendingUp, DollarSign, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const DashboardStats = () => {
  // Fetch dashboard statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      // Only query the Investor Network table since other tables don't exist yet
      const investorsResult = await supabase
        .from("Investor Network")
        .select("*", { count: "exact" });

      // For now, return 0 for properties and matches since those tables don't exist
      // These can be updated when the tables are created
      return {
        totalInvestors: investorsResult.count || 0,
        totalProperties: 0, // Properties table doesn't exist yet
        activeProperties: 0, // Properties table doesn't exist yet
        totalMatches: 0, // Matches table doesn't exist yet
        activeMatches: 0, // Matches table doesn't exist yet
        highScoreMatches: 0, // Matches table doesn't exist yet
      };
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 mb-2"></div>
              <div className="h-3 bg-muted rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Investors",
      value: stats?.totalInvestors || 0,
      description: "Active investor network",
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Active Properties",
      value: stats?.activeProperties || 0,
      description: `${stats?.totalProperties || 0} total properties`,
      icon: Building2,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "Total Matches",
      value: stats?.totalMatches || 0,
      description: `${stats?.activeMatches || 0} pending matches`,
      icon: Target,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "High-Score Matches",
      value: stats?.highScoreMatches || 0,
      description: "Matches above 80% score",
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Match Rate",
      value: stats?.totalProperties ? Math.round(((stats?.totalMatches || 0) / stats.totalProperties) * 100) : 0,
      description: "Avg matches per property",
      icon: DollarSign,
      color: "text-warning",
      bgColor: "bg-warning/10",
      suffix: "%",
    },
    {
      title: "Platform Activity",
      value: "Active",
      description: "System operational",
      icon: Calendar,
      color: "text-success",
      bgColor: "bg-success/10",
      badge: true,
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {statCards.map((stat, index) => (
        <Card key={index} className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {stat.badge ? (
                <Badge variant="secondary" className="bg-success/10 text-success">
                  {stat.value}
                </Badge>
              ) : (
                <div className="text-2xl font-bold text-foreground">
                  {stat.value}{stat.suffix || ""}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;