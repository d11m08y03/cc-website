"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { z } from "zod";
import { Pencil } from "lucide-react";

const memberSchema = z.object({
  fullName: z.string().min(1, "This field cannot be blank"),
  email: z.string().email("Please enter a valid email"),
  contactNumber: z
    .string()
    .min(1, "This field cannot be blank")
    .regex(/^[0-9]+$/, "Please enter a valid contact number"),
  foodPreference: z.string().min(1, "Please select a food preference"),
  tshirtSize: z.string().min(1, "Please select a T-shirt size"),
  allergies: z.string().optional(),
});

interface EditTeamMemberFormProps {
  memberData: {
    id: string;
    fullName: string;
    email: string;
    contactNumber: string;
    foodPreference: string;
    tshirtSize: string;
    allergies?: string | null;
    role: string;
  };
  onMemberUpdated: () => void;
}

export function EditTeamMemberForm({
  memberData,
  onMemberUpdated,
}: EditTeamMemberFormProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: memberData.fullName,
    email: memberData.email,
    contactNumber: memberData.contactNumber,
    foodPreference: memberData.foodPreference,
    tshirtSize: memberData.tshirtSize,
    allergies: memberData.allergies || "",
    role: memberData.role,
  });
  const [errors, setErrors] = useState<z.ZodFormattedError<z.infer<typeof memberSchema>> | null>(null);

  useEffect(() => {
    setFormData({
      fullName: memberData.fullName,
      email: memberData.email,
      contactNumber: memberData.contactNumber,
      foodPreference: memberData.foodPreference,
      tshirtSize: memberData.tshirtSize,
      allergies: memberData.allergies || "",
      role: memberData.role,
    });
  }, [memberData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = memberSchema.safeParse(formData);
    if (!result.success) {
      setErrors(result.error.format());
      toast.error("Please correct the errors in the form.");
      return;
    }
    setErrors(null);

    try {
      const response = await fetch(`/api/team-members/${memberData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Team member updated successfully!");
        setIsDialogOpen(false);
        onMemberUpdated(); // Callback to refresh team data in dashboard
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to update team member.");
      }
    } catch (error) {
      console.error("Error updating team member:", error);
      toast.error("An unexpected error occurred.");
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset form state when dialog is closed
      setFormData({
        fullName: memberData.fullName,
        email: memberData.email,
        contactNumber: memberData.contactNumber,
        foodPreference: memberData.foodPreference,
        tshirtSize: memberData.tshirtSize,
        allergies: memberData.allergies || "",
        role: memberData.role,
      });
      setErrors(null);
    }
    setIsDialogOpen(open);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Team Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fullName" className="text-right">Full Name</Label>
            <div className="col-span-3">
              <Input id="fullName" value={formData.fullName} onChange={handleChange} />
              {errors?.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName._errors[0]}</p>}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <div className="col-span-3">
              <Input id="email" type="email" value={formData.email} onChange={handleChange} />
              {errors?.email && <p className="text-red-500 text-xs mt-1">{errors.email._errors[0]}</p>}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contactNumber" className="text-right">Contact Number</Label>
            <div className="col-span-3">
              <Input id="contactNumber" value={formData.contactNumber} onChange={handleChange} />
              {errors?.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber._errors[0]}</p>}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="foodPreference" className="text-right">Food Preference</Label>
            <div className="col-span-3">
              <Select value={formData.foodPreference} onValueChange={(value) => handleSelectChange("foodPreference", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select food preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="veg">Veg</SelectItem>
                  <SelectItem value="non-veg">Non-Veg</SelectItem>
                </SelectContent>
              </Select>
              {errors?.foodPreference && <p className="text-red-500 text-xs mt-1">{errors.foodPreference._errors[0]}</p>}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tshirtSize" className="text-right">T-Shirt Size</Label>
            <div className="col-span-3">
              <Select value={formData.tshirtSize} onValueChange={(value) => handleSelectChange("tshirtSize", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select T-shirt size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xs">XS</SelectItem>
                  <SelectItem value="s">S</SelectItem>
                  <SelectItem value="m">M</SelectItem>
                  <SelectItem value="l">L</SelectItem>
                  <SelectItem value="xl">XL</SelectItem>
                  <SelectItem value="xxl">XXL</SelectItem>
                </SelectContent>
              </Select>
              {errors?.tshirtSize && <p className="text-red-500 text-xs mt-1">{errors.tshirtSize._errors[0]}</p>}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="allergies" className="text-right">Allergies</Label>
            <Input id="allergies" placeholder="if any" value={formData.allergies} onChange={handleChange} className="col-span-3" />
          </div>

          <Button type="submit" className="w-full mt-4">Update Member</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
