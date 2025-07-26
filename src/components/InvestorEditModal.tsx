
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
import { useEffect } from "react";
import { BuyBoxCriteriaForm } from "./BuyBoxCriteriaForm";

interface InvestorEditModalProps {
  investor: any;
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

export const InvestorEditModal = ({ investor, isOpen, onClose }: InvestorEditModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<InvestorFormData>();

  // Reset form when investor changes
  useEffect(() => {
    if (investor && isOpen) {
      console.log("Resetting form with investor data:", investor);
      reset({
        "Company Name": investor["Company Name"] || "",
        "Main POC": investor["Main POC"] || "",
        "Notes": investor["Notes"] || "",
        "HS Company URL": investor["HS Company URL"] || "",
        "Coverage Type": investor["Coverage Type"] || "Local",
        "Tier": investor.Tier || 1,
        "Weekly Cap": investor["Weekly Cap"] || 0,
        "Direct Purchase": investor["Direct Purchase"] || "NO",
        "Offer Types": investor["Offer Types"] || "",
        "Primary Markets": investor["Primary Markets"] || "",
        "Secondary Markets": investor["Secondary Markets"] || "",
        "Zip Codes": investor["Zip Codes"] || "",
        "Buy Box": investor["Buy Box"] || "",
        "Investor Tags": investor["Investor Tags"] || "",
        "Reason for Freeze": investor["Reason for Freeze"] || "",
        "Cold": investor["Cold"] || "",
        // Initialize structured buy box fields
        property_types: investor.property_types || [],
        min_price: investor.min_price || null,
        max_price: investor.max_price || null,
        property_conditions: investor.property_conditions || [],
        min_sqft: investor.min_sqft || null,
        max_sqft: investor.max_sqft || null,
        min_year_built: investor.min_year_built || null,
        max_year_built: investor.max_year_built || null,
        timeline_preferences: investor.timeline_preferences || [],
        investment_strategies: investor.investment_strategies || [],
      });
    }
  }, [investor, isOpen, reset]);

  const updateInvestorMutation = useMutation({
    mutationFn: async (data: InvestorFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      
      console.log("Updating investor with data:", data);
      const { error } = await supabase
        .from("Investor Network")
        .update(data)
        .eq("ID", investor.ID)
        .eq("user_id", user.id);
      
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investors"] });
      toast({ title: "Success", description: "Investor updated successfully" });
      onClose();
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({ 
        title: "Error", 
        description: `Failed to update investor: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: InvestorFormData) => {
    console.log("Form submitted with data:", data);
    updateInvestorMutation.mutate(data);
  };

  if (!investor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Investor - {investor["Company Name"]}</DialogTitle>
          <DialogDescription>
            Update investor profile, buy box criteria, and market preferences.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-company-name">Company Name *</Label>
              <Input 
                id="edit-company-name"
                {...register("Company Name", { required: "Company name is required" })}
              />
              {errors["Company Name"] && (
                <p className="text-sm text-destructive">{errors["Company Name"].message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-main-poc">Main POC</Label>
              <Input 
                id="edit-main-poc"
                {...register("Main POC")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea 
              id="edit-notes"
              placeholder="Add notes about communication history, last call, follow-ups, etc."
              className="min-h-[100px]"
              {...register("Notes")}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="space-y-2">
              <Label htmlFor="edit-company-url">Company URL</Label>
              <Input 
                id="edit-company-url"
                type="url"
                {...register("HS Company URL")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-coverage-type">Coverage Type</Label>
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
              <Label htmlFor="edit-tier">Tier</Label>
              <Input 
                id="edit-tier"
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
              <Label htmlFor="edit-weekly-cap">Weekly Capacity</Label>
              <Input 
                id="edit-weekly-cap"
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
              <Label htmlFor="edit-direct-purchase">Direct Purchase</Label>
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
              <Label htmlFor="edit-offer-types">Offer Types</Label>
              <Input 
                id="edit-offer-types"
                placeholder="e.g., Direct Purchase, Wholesale, Creative Finance"
                {...register("Offer Types")}
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-primary-markets">Primary Markets</Label>
              <Textarea 
                id="edit-primary-markets"
                placeholder="Enter primary markets separated by commas"
                {...register("Primary Markets")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-secondary-markets">Secondary Markets</Label>
              <Textarea 
                id="edit-secondary-markets"
                placeholder="Enter secondary markets separated by commas"
                {...register("Secondary Markets")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-zip-codes">Target Zip Codes</Label>
              <Textarea 
                id="edit-zip-codes"
                placeholder="Enter zip codes separated by commas"
                {...register("Zip Codes")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-buy-box">Legacy Buy Box Notes</Label>
              <Textarea 
                id="edit-buy-box"
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
              <Label htmlFor="edit-investor-tags">Investor Tags</Label>
              <Input 
                id="edit-investor-tags"
                placeholder="e.g., TEST, PAUSED, Licensed Agent"
                {...register("Investor Tags")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-reason-freeze">Reason for Freeze (if applicable)</Label>
              <Textarea 
                id="edit-reason-freeze"
                placeholder="Enter reason if investor is frozen"
                {...register("Reason for Freeze")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-cold">Cold Status</Label>
              <Input 
                id="edit-cold"
                placeholder="Cold status information"
                {...register("Cold")}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateInvestorMutation.isPending}>
              {updateInvestorMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
