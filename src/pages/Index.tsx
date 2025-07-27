import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Users, Target, MessageSquare, Plus, TrendingUp, MapPin } from "lucide-react";
import InvestorsTable from "@/components/InvestorsTable";
import PropertiesTable from "@/components/PropertiesTable";
import MatchesTable from "@/components/MatchesTable";
import DashboardStats from "@/components/DashboardStats";
import GlobalCoverageMapbox from "@/components/GlobalCoverageMapbox";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-primary p-2 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">RealEstate Match</h1>
                <p className="text-sm text-muted-foreground">Investor-Property Matching Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-success/10 text-success">
                Platform Active
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Navigation Tabs */}
          <TabsList className="grid w-full grid-cols-5 lg:w-fit lg:grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="investors" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Investors
            </TabsTrigger>
            <TabsTrigger value="coverage" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Coverage
            </TabsTrigger>
            <TabsTrigger value="properties" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Properties
            </TabsTrigger>
            <TabsTrigger value="matches" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Matches
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
                <p className="text-muted-foreground">
                  Overview of your real estate matching platform performance
                </p>
              </div>
            </div>
            <DashboardStats />
          </TabsContent>

          {/* Investors Tab */}
          <TabsContent value="investors" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Investors</h2>
                <p className="text-muted-foreground">
                  Manage your investor network and buy box criteria
                </p>
              </div>
              <Button 
                className="bg-gradient-primary hover:bg-primary-hover"
                onClick={() => setActiveTab("investors")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Investor
              </Button>
            </div>
            <InvestorsTable />
          </TabsContent>

          {/* Coverage Areas Tab */}
          <TabsContent value="coverage" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Coverage Areas</h2>
                <p className="text-muted-foreground">
                  Manage geographical coverage areas for your investor network
                </p>
              </div>
            </div>
            <GlobalCoverageMapbox />
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Properties</h2>
                <p className="text-muted-foreground">
                  Manage property listings and seller leads
                </p>
              </div>
              <Button className="bg-gradient-secondary hover:bg-secondary-hover">
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            </div>
            <PropertiesTable />
          </TabsContent>

          {/* Matches Tab */}
          <TabsContent value="matches" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Matches</h2>
                <p className="text-muted-foreground">
                  View and manage property-investor matches
                </p>
              </div>
              <Button variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Communications
              </Button>
            </div>
            <MatchesTable />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
