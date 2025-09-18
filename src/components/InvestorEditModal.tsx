import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InvestorEditModalProps {
  investor: any;
  isOpen: boolean;
  onClose: () => void;
}

interface InvestorFormData {
  company_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  status: string;
}

export const InvestorEditModal = ({ investor, isOpen, onClose }: InvestorEditModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<InvestorFormData>();

  // Reset form when investor changes
  useEffect(() => {
    if (investor && isOpen) {
      reset({
        company_name: investor.company_name || "",
        first_name: investor.first_name || "",
        last_name: investor.last_name || "",
        email: investor.email || "",
        phone_number: investor.phone_number || "",
        status: investor.status || "active",
      });
    }
  }, [investor, isOpen, reset]);

  const updateInvestorMutation = useMutation({
    mutationFn: async (data: InvestorFormData) => {
      const { error } = await supabase
        .from("investors")
        .update(data)
        .eq("id", investor.id);
      
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investors"] });
      toast({ 
        title: "Success", 
        description: "Investor updated successfully!" 
      });
      onClose();
    },
    onError: (error: any) => {
      console.error('Error updating investor:', error);
      toast({ 
        title: "Error", 
        description: `Failed to update investor: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: InvestorFormData) => {
    updateInvestorMutation.mutate(data);
  };

  if (!investor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Investor - {investor.company_name}</DialogTitle>
          <DialogDescription>
            Update investor profile information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-company-name">Company Name *</Label>
              <Input 
                id="edit-company-name"
                {...register("company_name", { required: "Company name is required" })}
              />
              {errors.company_name && (
                <p className="text-sm text-destructive">{errors.company_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-first-name">First Name *</Label>
              <Input 
                id="edit-first-name"
                {...register("first_name", { required: "First name is required" })}
              />
              {errors.first_name && (
                <p className="text-sm text-destructive">{errors.first_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-last-name">Last Name *</Label>
              <Input 
                id="edit-last-name"
                {...register("last_name", { required: "Last name is required" })}
              />
              {errors.last_name && (
                <p className="text-sm text-destructive">{errors.last_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input 
                id="edit-email"
                type="email"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-phone-number">Phone Number *</Label>
              <Input 
                id="edit-phone-number"
                {...register("phone_number", { required: "Phone number is required" })}
              />
              {errors.phone_number && (
                <p className="text-sm text-destructive">{errors.phone_number.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateInvestorMutation.isPending}>
              {updateInvestorMutation.isPending ? "Updating..." : "Update Investor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};