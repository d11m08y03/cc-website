"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogClose,
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
import { useSession } from "next-auth/react";
import { UserPlus, Loader2 } from "lucide-react";

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

interface AddTeamMemberFormProps {
  teamId: string;
  currentMemberCount: number;
  onMemberAdded: () => void;
}

export function AddTeamMemberForm({
  teamId,
  currentMemberCount,
  onMemberAdded,
}: AddTeamMemberFormProps) {
  const { data: session } = useSession();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    contactNumber: "",
    foodPreference: "",
    tshirtSize: "",
    allergies: "",
    role: "member", // Default role, not user-selectable
  });
  const [errors, setErrors] = useState<z.ZodFormattedError<z.infer<typeof memberSchema>> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMaxMembersDialogOpen, setIsMaxMembersDialogOpen] = useState(false);

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

    setIsLoading(true);
    try {
      const response = await fetch("/api/team-members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, teamId, userId: session?.user?.id }),
      });

      if (response.ok) {
        toast.success("Team member added successfully!");
        setIsDialogOpen(false);
        setFormData({
          fullName: "",
          email: "",
          contactNumber: "",
          foodPreference: "",
          tshirtSize: "",
          allergies: "",
          role: "member",
        });
        onMemberAdded(); // Callback to refresh team data in dashboard
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to add team member.");
      }
    } catch (error) {
      console.error("Error adding team member:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset form state when dialog is closed
      setFormData({
        fullName: "",
        email: "",
        contactNumber: "",
        foodPreference: "",
        tshirtSize: "",
        allergies: "",
        role: "member",
      });
      setErrors(null);
    } else if (currentMemberCount >= 5) {
      setIsMaxMembersDialogOpen(true);
      return; // Prevent dialog from opening
    }
    setIsDialogOpen(open);
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="ghost" className="flex-1 text-2xl font-bold">
            <UserPlus className="h-8 w-8 mr-4" /> Add Team Member
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Team Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-4">
              <Label htmlFor="fullName" className="text-right">Full Name</Label>
              <div className="col-span-3">
                <Input id="fullName" value={formData.fullName} onChange={handleChange} />
                {errors?.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName._errors[0]}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <div className="col-span-3">
                <Input id="email" type="email" value={formData.email} onChange={handleChange} />
                {errors?.email && <p className="text-red-500 text-xs mt-1">{errors.email._errors[0]}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-4">
              <Label htmlFor="contactNumber" className="text-right">Contact Number</Label>
              <div className="col-span-3">
                <Input id="contactNumber" value={formData.contactNumber} onChange={handleChange} />
                {errors?.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber._errors[0]}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-4">
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

            <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-4">
              <Label htmlFor="tshirtSize" className="text-right">T-Shirt Size</Label>
              <div className="col-span-3">
                <Select value={formData.tshirtSize} onValueChange={(value) => handleSelectChange("tshirtSize", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select T-shirt size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="XS">XS</SelectItem>
                  <SelectItem value="S">S</SelectItem>
                  <SelectItem value="M">M</SelectItem>
                  <SelectItem value="L">L</SelectItem>
                  <SelectItem value="XL">XL</SelectItem>
                  <SelectItem value="XXL">XXL</SelectItem>
                  </SelectContent>
                </Select>
                {errors?.tshirtSize && <p className="text-red-500 text-xs mt-1">{errors.tshirtSize._errors[0]}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-4">
              <Label htmlFor="allergies" className="text-right">Allergies</Label>
              <Input id="allergies" placeholder="if any" value={formData.allergies} onChange={handleChange} className="col-span-3" />
            </div>

            <Button type="submit" className="w-full mt-4" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              {isLoading ? "Adding..." : "Add Member"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isMaxMembersDialogOpen} onOpenChange={setIsMaxMembersDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cannot Add Member</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            A team cannot have more than 5 members.
          </DialogDescription>
          <DialogFooter>
            <DialogClose asChild>
              <Button>Okay</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
