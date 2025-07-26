
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { BuyBoxCriteriaForm } from "./BuyBoxCriteriaForm";

interface InvestorCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface InvestorFormData {
  "Company Name": string;
  "Main POC": string;
  "Notes": string;
  "HS Company URL": string;
  "Coverage Type": string;
  "Tier": number;
  "Weekly Cap": number;
  "Direct Purchase": string;
  "Offer Types": string;
  "Primary Markets": string;
  "Secondary Markets": string;
  "Zip Codes": string;
  "Buy Box": string;
  "Investor Tags": string;
  "Reason for Freeze": string;
  "Cold": string;
  // New structured buy box fields
  property_types: string[];
  min_price: number;
  max_price: number;
  property_conditions: string[];
  min_sqft: number;
  max_sqft: number;
  min_year_built: number;
  max_year_built: number;
  timeline_preferences: string[];
  investment_strategies: string[];
}

export const InvestorCreateModal = ({ isOpen, onClose }: InvestorCreateModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<InvestorFormData>({
    defaultValues: {
      "Company Name": "",
      "Main POC": "",
      "Notes": "",
      "HS Company URL": "",
      "Coverage Type": "Local",
      "Tier": 5,
      "Weekly Cap": 25,
      "Direct Purchase": "NO",
      "Offer Types": "",
      "Primary Markets": "",
      "Secondary Markets": "",
      "Zip Codes": "",
      "Buy Box": "",
      "Investor Tags": "",
      "Reason for Freeze": "",
      "Cold": "",
      // Initialize structured buy box fields
      property_types: [],
      min_price: undefined,
      max_price: undefined,
      property_conditions: [],
      min_sqft: undefined,
      max_sqft: undefined,
      min_year_built: undefined,
      max_year_built: undefined,
      timeline_preferences: [],
      investment_strategies: [],
    }
  });

  const createInvestorMutation = useMutation({
    mutationFn: async (data: InvestorFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      
      // Exclude ID field and add user_id - let database auto-generate ID
      const { ID, ...dataWithoutId } = data as any;
      const investorData = { ...dataWithoutId, user_id: user.id };
      console.log("Creating investor with data:", investorData);
      const { error } = await supabase
        .from("Investor Network")
        .insert(investorData as any);
      
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investors"] });
      toast({ title: "Success", description: "Investor created successfully" });
      reset();
      onClose();
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({ 
        title: "Error", 
        description: `Failed to create investor: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: InvestorFormData) => {
    console.log("Form submitted with data:", data);
    createInvestorMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Investor</DialogTitle>
          <DialogDescription>
            Create a new investor profile with buy box criteria and market preferences.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name *</Label>
              <Input 
                id="company-name"
                {...register("Company Name", { required: "Company name is required" })}
              />
              {errors["Company Name"] && (
                <p className="text-sm text-destructive">{errors["Company Name"].message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="main-poc">Main POC</Label>
              <Input 
                id="main-poc"
                {...register("Main POC")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes"
              placeholder="Add notes about communication history, last call, follow-ups, etc."
              className="min-h-[100px]"
              {...register("Notes")}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="space-y-2">
              <Label htmlFor="company-url">Company URL</Label>
              <Input 
                id="company-url"
                type="url"
                {...register("HS Company URL")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverage-type">Coverage Type</Label>
              <Select 
                value={watch("Coverage Type")} 
                onValueChange={(value) => setValue("Coverage Type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select coverage type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Local">Local</SelectItem>
                  <SelectItem value="State">State</SelectItem>
                  <SelectItem value="Multi-State">Multi-State</SelectItem>
                  <SelectItem value="National">National</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tier">Tier</Label>
              <Input 
                id="tier"
                type="number"
                min="1"
                max="10"
                {...register("Tier", { 
                  required: "Tier is required",
                  min: { value: 1, message: "Tier must be at least 1" },
                  max: { value: 10, message: "Tier cannot exceed 10" },
                  valueAsNumber: true
                })}
              />
              {errors.Tier && (
                <p className="text-sm text-destructive">{errors.Tier.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="weekly-cap">Weekly Capacity</Label>
              <Input 
                id="weekly-cap"
                type="number"
                min="0"
                {...register("Weekly Cap", { 
                  required: "Weekly capacity is required",
                  min: { value: 0, message: "Weekly capacity cannot be negative" },
                  valueAsNumber: true
                })}
              />
              {errors["Weekly Cap"] && (
                <p className="text-sm text-destructive">{errors["Weekly Cap"].message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="direct-purchase">Direct Purchase</Label>
              <Select 
                value={watch("Direct Purchase")} 
                onValueChange={(value) => setValue("Direct Purchase", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="YES">Yes</SelectItem>
                  <SelectItem value="NO">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="offer-types">Offer Types</Label>
              <Input 
                id="offer-types"
                placeholder="e.g., Direct Purchase, Wholesale, Creative Finance"
                {...register("Offer Types")}
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary-markets">Primary Markets</Label>
              <Textarea 
                id="primary-markets"
                placeholder="Enter primary markets separated by commas"
                {...register("Primary Markets")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondary-markets">Secondary Markets</Label>
              <Textarea 
                id="secondary-markets"
                placeholder="Enter secondary markets separated by commas"
                {...register("Secondary Markets")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zip-codes">Target Zip Codes</Label>
              <Textarea 
                id="zip-codes"
                placeholder="Enter zip codes separated by commas"
                {...register("Zip Codes")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buy-box">Legacy Buy Box Notes</Label>
              <Textarea 
                id="buy-box"
                placeholder="Additional buy box notes (use structured criteria below for matching)"
                {...register("Buy Box")}
              />
            </div>
          </div>

          <Separator />

          {/* Structured Buy Box Criteria */}
          <BuyBoxCriteriaForm
            register={register}
            watch={watch}
            setValue={setValue}
            errors={errors}
          />

          <div className="grid grid-cols-1 gap-4">

            <div className="space-y-2">
              <Label htmlFor="investor-tags">Investor Tags</Label>
              <Input 
                id="investor-tags"
                placeholder="e.g., TEST, PAUSED, Licensed Agent"
                {...register("Investor Tags")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason-freeze">Reason for Freeze (if applicable)</Label>
              <Textarea 
                id="reason-freeze"
                placeholder="Enter reason if investor is frozen"
                {...register("Reason for Freeze")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cold">Cold Status</Label>
              <Input 
                id="cold"
                placeholder="Cold status information"
                {...register("Cold")}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createInvestorMutation.isPending}>
              {createInvestorMutation.isPending ? "Creating..." : "Create Investor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
