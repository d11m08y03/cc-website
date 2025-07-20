"use client";

import { useEffect, useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { NeonGradientCard } from "@/components/magicui/neon-gradient-card";
import {
  User,
  Users,
  FileText,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  Pencil,
} from "lucide-react";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

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

const Step1 = ({
  nextStep,
  setTeamName,
  setNumPeople,
  teamName,
  numPeople,
  errors,
}: any) => (
  <div>
    <div className="flex items-center gap-2 mb-4">
      <Users className="w-6 h-6" />
      <h3 className="text-lg font-semibold">Team Details</h3>
    </div>
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="team-name" className="text-right">
        Team Name
      </Label>
      <div className="col-span-3">
        <Input
          id="team-name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
        />
        {errors?.teamName && (
          <p className="text-red-500 text-xs mt-1">
            {errors.teamName._errors[0]}
          </p>
        )}
      </div>
    </div>
    <div className="grid grid-cols-4 items-center gap-4 mt-4">
      <Label htmlFor="num-people" className="text-right">
        Number of People
      </Label>
      <Select
        onValueChange={(value) => setNumPeople(parseInt(value, 10))}
        defaultValue={numPeople.toString()}
      >
        <SelectTrigger className="col-span-3">
          <SelectValue placeholder="Select number of people" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">1</SelectItem>
          <SelectItem value="3">3</SelectItem>
          <SelectItem value="4">4</SelectItem>
          <SelectItem value="5">5</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="flex justify-end mt-4">
      <Button onClick={nextStep}>
        Next <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  </div>
);

const MemberForm = ({
  memberData,
  updateMemberData,
  nextStep,
  prevStep,
  memberIndex,
  numPeople,
  errors,
}: any) => {
  const handleChange = (field: any, value: any) => {
    updateMemberData(memberIndex, { ...memberData, [field]: value });
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <User className="w-6 h-6" />
        <h3 className="text-lg font-semibold">
          {memberIndex === 0
            ? "Team Leader Information"
            : `Member ${memberIndex + 1} of ${numPeople}`}
        </h3>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor={`name-${memberIndex}`} className="text-right">
            Full Name
          </Label>
          <div className="col-span-3">
            <Input
              id={`name-${memberIndex}`}
              value={memberData.fullName || ""}
              onChange={(e) => handleChange("fullName", e.target.value)}
            />
            {errors?.fullName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.fullName._errors[0]}
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor={`email-${memberIndex}`} className="text-right">
            Email
          </Label>
          <div className="col-span-3">
            <Input
              id={`email-${memberIndex}`}
              type="email"
              value={memberData.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
            />
            {errors?.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email._errors[0]}
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor={`contact-${memberIndex}`} className="text-right">
            Contact Number
          </Label>
          <div className="col-span-3">
            <Input
              id={`contact-${memberIndex}`}
              value={memberData.contactNumber || ""}
              onChange={(e) => handleChange("contactNumber", e.target.value)}
            />
            {errors?.contactNumber && (
              <p className="text-red-500 text-xs mt-1">
                {errors.contactNumber._errors[0]}
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor={`food-${memberIndex}`} className="text-right">
            Food Preference
          </Label>
          <div className="col-span-3">
            <Select
              value={memberData.foodPreference || ""}
              onValueChange={(value) => handleChange("foodPreference", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select food preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="veg">Veg</SelectItem>
                <SelectItem value="non-veg">Non-Veg</SelectItem>
              </SelectContent>
            </Select>
            {errors?.foodPreference && (
              <p className="text-red-500 text-xs mt-1">
                {errors.foodPreference._errors[0]}
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor={`allergies-${memberIndex}`} className="text-right">
            Allergies
          </Label>
          <Input
            id={`allergies-${memberIndex}`}
            placeholder="if any"
            value={memberData.allergies || ""}
            onChange={(e) => handleChange("allergies", e.target.value)}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor={`tshirt-${memberIndex}`} className="text-right">
            T-Shirt Size
          </Label>
          <div className="col-span-3">
            <Select
              value={memberData.tshirtSize || ""}
              onValueChange={(value) => handleChange("tshirtSize", value)}
            >
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
            {errors?.tshirtSize && (
              <p className="text-red-500 text-xs mt-1">
                {errors.tshirtSize._errors[0]}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-between mt-4">
        <Button onClick={prevStep}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button onClick={nextStep}>
          {memberIndex === numPeople - 1 ? "Next" : "Next Member"}{" "}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

const Step3 = ({ prevStep, nextStep, setProjectFile, setProjectFileName }: any) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are allowed.");
        setProjectFile(null);
        setProjectFileName(null);
        e.target.value = ""; // Clear the input
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProjectFile(reader.result); // Store Base64 string
        setProjectFileName(file.name); // Store file name
      };
      reader.readAsDataURL(file);
    } else {
      setProjectFile(null);
      setProjectFileName(null);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-6 h-6" />
        <h3 className="text-lg font-semibold">Project Submission</h3>
      </div>
      <div className="grid grid-cols-1 gap-4 border-t pt-4 mt-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="project-file" className="text-right">
            <Upload className="w-4 h-4 mr-2 inline" /> Upload
          </Label>
          <Input
            id="project-file"
            type="file"
            onChange={handleFileChange}
            className="col-span-3"
          />
        </div>
      </div>
      <div className="flex justify-between mt-4">
        <Button onClick={prevStep}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button onClick={nextStep}>
          Review <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

const Step4 = ({ prevStep, teamData, handleSubmit }: any) => (
  <div className="w-full p-4 sm:p-8 flex justify-center">
    <Card className="w-full max-w-3xl h-[600px] flex flex-col">
      {/* Header */}
      <CardHeader>
        <div className="flex items-center gap-2">
          <CheckCircle className="w-6 h-6" />
          <CardTitle>Review Your Information</CardTitle>
        </div>
      </CardHeader>

      {/* Scrollable Content */}
      <CardContent className="overflow-y-auto flex-1 space-y-4 pr-2">
        {/* Team Name */}
        <div>
          <h4 className="font-semibold">Team Name</h4>
          <p>{teamData.teamName}</p>
        </div>

        <Separator />

        {/* Members */}
        <div>
          <h4 className="font-semibold">Members</h4>
          {teamData.members.map((member: any, index: number) => (
            <div key={index} className="mt-2">
              <p className="font-semibold">
                {index === 0 ? "Team Leader" : `Member ${index + 1}`}
              </p>
              <p>Full Name: {member.fullName}</p>
              <p>Email: {member.email}</p>
              <p>Contact: {member.contactNumber}</p>
              <p>Food Preference: {member.foodPreference}</p>
              <p>Allergies: {member.allergies || "None"}</p>
              <p>T-Shirt Size: {member.tshirtSize}</p>
              {index < teamData.members.length - 1 && (
                <Separator className="my-2" />
              )}
            </div>
          ))}
        </div>

        <Separator />

        {/* Project File */}
        <div>
          <h4 className="font-semibold">Project File</h4>
          <p>{teamData.projectFile ? "File uploaded (Base64)" : "Not provided"}</p>
        </div>
      </CardContent>

      {/* Buttons at bottom */}
      <div className="p-4 border-t flex justify-between">
        <Button onClick={prevStep}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button onClick={handleSubmit}>Submit</Button>
      </div>
    </Card>
  </div>
);

export function RegistrationForm() {
  const [step, setStep] = useState(1);
  const [teamName, setTeamName] = useState("");
  const [numPeople, setNumPeople] = useState(3);
  const [members, setMembers] = useState<any[]>([]);
  const [currentMember, setCurrentMember] = useState(0);
  const [projectFile, setProjectFile] = useState<string | null>(null);
  const [projectFileName, setProjectFileName] = useState<string | null>(null);
  const [errors, setErrors] = useState<any>({});
  const { data: session, status } = useSession();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    // Ensure members array is correctly sized when numPeople changes
    setMembers((prevMembers) => {
      const newMembers = [...prevMembers];
      while (newMembers.length < numPeople) {
        newMembers.push({});
      }
      return newMembers.slice(0, numPeople);
    });
  }, [numPeople]);

  const updateMemberData = (index: number, data: any) => {
    const newMembers = [...members];
    newMembers[index] = data;
    setMembers(newMembers);
    // Clear errors for the field being updated
    const field = Object.keys(data).find(
      (key) => data[key] !== (members[index] && members[index][key]),
    );
    if (field && errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const validateStep = () => {
    setErrors({});
    if (step === 1) {
      if (!teamName.trim()) {
        setErrors({ teamName: { _errors: ["Team name cannot be blank"] } });
        return false;
      }
    } else if (step === 2) {
      const result = memberSchema.safeParse(members[currentMember]);
      if (!result.success) {
        setErrors(result.error.format());
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;

    if (step === 2 && currentMember < numPeople - 1) {
      setCurrentMember(currentMember + 1);
    } else {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setErrors({});
    if (step === 2 && currentMember > 0) {
      setCurrentMember(currentMember - 1);
    } else {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    const teamData = {
      teamDetails: {
        teamName,
        projectFile: projectFile,
        projectFileName: projectFileName,
        userId: session?.user?.id, // Include userId from session
      },
      members,
    };

    try {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(teamData),
      });

      if (response.ok) {
        toast.success("Registration submitted successfully!");
        setIsDialogOpen(false); // Close the dialog on success
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to submit registration.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An unexpected error occurred.");
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1
            nextStep={nextStep}
            setTeamName={setTeamName}
            setNumPeople={setNumPeople}
            teamName={teamName}
            numPeople={numPeople}
            errors={errors}
          />
        );
      case 2:
        return (
          <MemberForm
            memberIndex={currentMember}
            numPeople={numPeople}
            memberData={members[currentMember] || {}}
            updateMemberData={updateMemberData}
            nextStep={nextStep}
            prevStep={prevStep}
            errors={errors}
          />
        );
      case 3:
        return (
          <Step3
            nextStep={nextStep}
            prevStep={prevStep}
            setProjectFile={setProjectFile}
            setProjectFileName={setProjectFileName}
          />
        );
      case 4:
        return (
          <Step4
            prevStep={prevStep}
            teamData={{
              teamName,
              members,
              projectFile: projectFile ? "File uploaded (Base64)" : null,
            projectFileName: projectFileName,
            }}
            handleSubmit={handleSubmit}
          />
        );
      default:
        return null;
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset form state when dialog is closed
      setStep(1);
      setTeamName("");
      setNumPeople(3);
      setMembers([]);
      setCurrentMember(0);
      setProjectFile(null);
      setProjectFileName(null);
      setErrors({});
    } else if (status === "unauthenticated") {
      toast.error("Please log in to register for the event.");
      return; // Prevent dialog from opening
    }
    setIsDialogOpen(open);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full cursor-pointer" disabled={status === "loading"}>
          Register Now
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-0">
        <NeonGradientCard>
          <div className="p-4">
            <DialogHeader>
              <DialogTitle>
                Event Registration -{" "}
                {step === 2
                  ? `Member ${currentMember + 1} of ${numPeople}`
                  : `Step ${step} of 4`}
              </DialogTitle>
            </DialogHeader>
            {renderStep()}
          </div>
        </NeonGradientCard>
      </DialogContent>
    </Dialog>
  );
}
