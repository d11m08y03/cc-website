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
  Loader2,
} from "lucide-react";
import { z } from "zod";
import { signIn, useSession } from "next-auth/react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
    <div className="flex items-center gap-2 mb-4 font-semibold text-lg">
		Team Details
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
      <Label htmlFor="team-name" className="h-full flex items-center justify-start sm:justify-end">
        Team Name
      </Label>
      <div className="sm:col-span-3">
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
    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4 mt-4">
      <Label htmlFor="num-people" className="h-full flex items-center justify-start sm:justify-end">
        Members
      </Label>
      <Select
        onValueChange={(value) => setNumPeople(parseInt(value, 10))}
        defaultValue={numPeople.toString()}
      >
        <SelectTrigger className="sm:col-span-3">
          <SelectValue placeholder="Select number of people" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="3">3</SelectItem>
          <SelectItem value="4">4</SelectItem>
          <SelectItem value="5">5</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="flex justify-end mt-4">
      <Button onClick={nextStep}>
        <ArrowRight className="w-4 h-4" />
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
        <h3 className="text-lg font-semibold">
          {memberIndex === 0 ? "Team Leader Information" : ""}
        </h3>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
          <Label
            htmlFor={`name-${memberIndex}`}
            className="h-full flex items-center justify-start sm:justify-end"
          >
            Full Name
          </Label>
          <div className="sm:col-span-3">
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
        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
          <Label
            htmlFor={`email-${memberIndex}`}
            className="h-full flex items-center justify-start sm:justify-end"
          >
            Email
          </Label>
          <div className="sm:col-span-3">
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
        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
          <Label
            htmlFor={`contact-${memberIndex}`}
            className="h-full flex items-center justify-start sm:justify-end"
          >
            Contact Number
          </Label>
          <div className="sm:col-span-3">
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
        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
          <Label
            htmlFor={`food-${memberIndex}`}
            className="h-full flex items-center justify-start sm:justify-end"
          >
            Food Preference
          </Label>
          <div className="sm:col-span-3">
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
        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
          <Label
            htmlFor={`allergies-${memberIndex}`}
            className="h-full flex items-center justify-start sm:justify-end"
          >
            Allergies
          </Label>
          <Input
            id={`allergies-${memberIndex}`}
            placeholder="if any"
            value={memberData.allergies || ""}
            onChange={(e) => handleChange("allergies", e.target.value)}
            className="sm:col-span-3"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
          <Label
            htmlFor={`tshirt-${memberIndex}`}
            className="h-full flex items-center justify-start sm:justify-end"
          >
            T-Shirt Size
          </Label>
          <div className="sm:col-span-3">
            <Select
              value={memberData.tshirtSize || ""}
              onValueChange={(value) => handleChange("tshirtSize", value)}
            >
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
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Button onClick={nextStep}>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

const Step3 = ({
  prevStep,
  nextStep,
  setProjectFile,
  setProjectFileName,
}: any) => {
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      if (file.type !== "application/pdf") {
        setFileError("Only PDF files are allowed.");
        setProjectFile(null);
        setProjectFileName(null);
        e.target.value = ""; // Clear the input
        return;
      }
      setFileError(null); // Clear error if file is valid
      const reader = new FileReader();
      reader.onloadend = () => {
        setProjectFile(reader.result); // Store Base64 string
        setProjectFileName(file.name); // Store file name
      };
      reader.readAsDataURL(file);
    } else {
      setProjectFile(null);
      setProjectFileName(null);
      setFileError(null); // Clear error if no file is selected
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-6 h-6" />
      </div>
      <div className="grid grid-cols-1 gap-4 border-t pt-4 mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
          <Label
            htmlFor="project-file"
            className="h-full flex items-center justify-start sm:justify-end"
          >
            <Upload className="w-4 h-4 mr-2 inline" /> Upload
          </Label>
          <div className="sm:col-span-3">
            <Input
              id="project-file"
              type="file"
              onChange={handleFileChange}
              className="sm:col-span-3"
            />
            {fileError && (
              <p className="text-red-500 text-xs mt-1">{fileError}</p>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-between mt-4">
        <Button onClick={prevStep}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Button onClick={nextStep}>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

const Step4 = ({ prevStep, handleSubmit, isLoading }: any) => (
  <div className="w-full pt-4 flex flex-col items-center justify-center text-center p-4">
    <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
    <h2 className="text-2xl font-semibold mb-2">Confirm Your Registration</h2>
    <p className="text-lg mb-4">
      Please confirm your registration. You will be able to edit your
      information at any time after registration.
    </p>
    <div className="p-4 border-t flex justify-between w-full mt-auto">
      <Button onClick={prevStep} disabled={isLoading}>
        <ArrowLeft className="w-4 h-4" />
      </Button>
      <Button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle className="mr-2 h-4 w-4" />
        )}
        {isLoading ? "Registering..." : "Confirm and Register"}
      </Button>
    </div>
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
  const [hasRegisteredTeam, setHasRegisteredTeam] = useState(false);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isClientLoaded, setIsClientLoaded] = useState(false);

  useEffect(() => {
    const checkRegistrationStatus = async () => {
      if (status === "authenticated") {
        try {
          const response = await fetch("/api/registration-status");
          if (response.ok) {
            const data = await response.json();
            setHasRegisteredTeam(data.isRegistered);
          } else {
            console.error("Failed to fetch registration status");
            setHasRegisteredTeam(false);
          }
        } catch (error) {
          console.error("Error fetching registration status:", error);
          setHasRegisteredTeam(false);
        } finally {
          setIsClientLoaded(true);
        }
      } else {
        setHasRegisteredTeam(false);
        setIsClientLoaded(true);
      }
    };

    checkRegistrationStatus();
  }, [session, status]);

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

	const router = useRouter();

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsLoading(true);
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

      console.log(teamData);

      if (response.ok) {
        toast.success("Registration submitted successfully!");
        setIsDialogOpen(false); // Close the dialog on success

        router.push("/dashboard"); // Redirect to dashboard
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to submit registration.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
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
            isLoading={isLoading}
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
      setIsLoginPromptOpen(true); // Open login prompt instead of registration form
      return; // Prevent dialog from opening
    }
    setIsDialogOpen(open);
  };

  const handleLogin = async () => {
    try {
      const result = await signIn("google");
      if (result?.error) {
        toast.error(`Login failed: ${result.error}`);
      } else {
        setIsLoginPromptOpen(false); // Close login prompt on successful login
      }
    } catch {
      toast.error("An unexpected error occurred during login.");
    }
  };

  const neonColor = {
    firstColor: "#ff1a1a",
    secondColor: "#ff4d4d",
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {!isClientLoaded ? (
            <Button className="w-full cursor-pointer" disabled>
              Loading...
            </Button>
          ) : hasRegisteredTeam ? (
            <Button asChild className="w-full cursor-pointer">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <Button
              className="w-full cursor-pointer"
              disabled={status === "loading"}
            >
              Register Now
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] p-0">
          <NeonGradientCard neonColors={neonColor}>
            <div className="p-4">
              <DialogHeader className="flex flex-row justify-between items-center w-full">
                <DialogTitle className="sr-only">
                  Event Registration Form
                </DialogTitle>
                <span className="text-lg font-semibold">
                  {step === 2
                    ? `Member ${currentMember + 1} of ${numPeople}`
                    : `Step ${step} of 4`}
                </span>
              </DialogHeader>
              {renderStep()}
            </div>
          </NeonGradientCard>
        </DialogContent>
      </Dialog>

      <Dialog open={isLoginPromptOpen} onOpenChange={setIsLoginPromptOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p>Please log in to register for the event.</p>
            <Button onClick={handleLogin}>Login with Google</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
