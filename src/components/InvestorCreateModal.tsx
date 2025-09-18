import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InvestorCreateModalProps {
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

export const InvestorCreateModal = ({ isOpen, onClose }: InvestorCreateModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<InvestorFormData>({
    defaultValues: {
      company_name: "",
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      status: "active",
    }
  });

  const createInvestorMutation = useMutation({
    mutationFn: async (data: InvestorFormData) => {
      const { error } = await supabase
        .from("investors")
        .insert(data);
      
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investors"] });
      toast({ 
        title: "Success", 
        description: "Investor created successfully!" 
      });
      reset();
      onClose();
    },
    onError: (error: any) => {
      console.error('Error creating investor:', error);
      toast({ 
        title: "Error", 
        description: `Failed to create investor: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: InvestorFormData) => {
    createInvestorMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Investor</DialogTitle>
          <DialogDescription>
            Add a new investor to your network.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name *</Label>
              <Input 
                id="company-name"
                {...register("company_name", { required: "Company name is required" })}
              />
              {errors.company_name && (
                <p className="text-sm text-destructive">{errors.company_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="first-name">First Name *</Label>
              <Input 
                id="first-name"
                {...register("first_name", { required: "First name is required" })}
              />
              {errors.first_name && (
                <p className="text-sm text-destructive">{errors.first_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last-name">Last Name *</Label>
              <Input 
                id="last-name"
                {...register("last_name", { required: "Last name is required" })}
              />
              {errors.last_name && (
                <p className="text-sm text-destructive">{errors.last_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input 
                id="email"
                type="email"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="phone-number">Phone Number *</Label>
              <Input 
                id="phone-number"
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
            <Button type="submit" disabled={createInvestorMutation.isPending}>
              {createInvestorMutation.isPending ? "Creating..." : "Create Investor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};