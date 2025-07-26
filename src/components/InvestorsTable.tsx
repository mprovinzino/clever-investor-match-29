
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { InvestorCard } from "./InvestorCard";
import { InvestorProfileModal } from "./InvestorProfileModal";
import { InvestorEditModal } from "./InvestorEditModal";
import { InvestorCreateModal } from "./InvestorCreateModal";

const InvestorsTable = () => {
  const [selectedInvestor, setSelectedInvestor] = useState<any>(null);
  const [editingInvestor, setEditingInvestor] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: investors, isLoading, error } = useQuery({
    queryKey: ["investors"],
    queryFn: async () => {
      console.log("Fetching investors...");
      const { data, error } = await supabase
        .from("Investor Network")
        .select("*")
        .order("ID", { ascending: false });
      
      console.log("Investors data:", data);
      console.log("Investors error:", error);
      
      if (error) throw error;
      return data;
    },
  });

  const filteredInvestors = investors?.filter((investor: any) =>
    investor["Company Name"]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    investor["Main POC"]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    investor["Primary Markets"]?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleEditInvestor = (investor: any) => {
    setEditingInvestor(investor);
    setSelectedInvestor(null); // Close profile modal if open
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Investors...</CardTitle>
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
          <CardTitle className="text-destructive">Error Loading Investors</CardTitle>
          <CardDescription>
            {error instanceof Error ? error.message : "Failed to load investor data"}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 bg-success rounded-full"></div>
                Investor Network ({filteredInvestors.length})
              </CardTitle>
              <CardDescription>
                Manage your investor database and buy box criteria
              </CardDescription>
            </div>
            <Button className="shrink-0" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Investor
            </Button>
          </div>
          
          <div className="flex items-center gap-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search investors by company, contact, or market..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {!investors || investors.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground text-lg mb-4">No investors found</div>
              <p className="text-sm text-muted-foreground mb-6">
                Start by adding your first investor to the network
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Investor
              </Button>
            </div>
          ) : filteredInvestors.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground text-lg mb-4">No matching investors</div>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search criteria
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredInvestors.map((investor: any) => (
                <InvestorCard
                  key={investor.ID}
                  investor={investor}
                  onViewProfile={(investor) => setSelectedInvestor(investor)}
                  onEditInvestor={handleEditInvestor}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <InvestorProfileModal
        investor={selectedInvestor}
        isOpen={!!selectedInvestor}
        onClose={() => setSelectedInvestor(null)}
        onEditInvestor={handleEditInvestor}
      />

      <InvestorEditModal
        investor={editingInvestor}
        isOpen={!!editingInvestor}
        onClose={() => setEditingInvestor(null)}
      />

      <InvestorCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  );
};

export default InvestorsTable;
