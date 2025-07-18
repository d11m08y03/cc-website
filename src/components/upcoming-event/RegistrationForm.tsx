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
} from "lucide-react";
import { z, ZodError } from "zod";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface Member {
	fullName: string;
	email: string;
	contactNumber: string;
	foodPreference: string;
	tshirtSize: string;
	allergies?: string;
}

interface TeamDetails {
	teamName: string;
	members: Member[];
	projectFile: string | null;
	userId?: string; // Optional as it's added on the server for security
}

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

interface Step1Props {
	nextStep: () => void;
	setTeamName: (name: string) => void;
	setNumPeople: (num: number) => void;
	teamName: string;
	numPeople: number;
	errors: ZodError | null;
}

const Step1 = ({
	nextStep,
	setTeamName,
	setNumPeople,
	teamName,
	numPeople,
	errors,
}: Step1Props) => {
	(
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
					{errors?.formErrors?.fieldErrors?.teamName && (
						<p className="text-red-500 text-xs mt-1">
							{errors.formErrors.fieldErrors.teamName[0]}
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
						<SelectItem value="3">3</SelectItem>
						<SelectItem value="4">4</SelectItem>
						<SelectItem value="5">5</SelectItem>
					</SelectContent>
				</Select>
			</div>
			<div className="flex justify-end mt-4">
				<Button onClick={nextStep} size="lg">
					Next <ArrowRight className="w-4 h-4 ml-2" />
				</Button>
			</div>
		</div>
	);

	interface MemberFormProps {
		memberData: Member;
		updateMemberData: (index: number, data: Member) => void;
		nextStep: () => void;
		prevStep: () => void;
		memberIndex: number;
		numPeople: number;
		errors: ZodError | null;
	}

	const MemberForm = ({
		memberData,
		updateMemberData,
		nextStep,
		prevStep,
		memberIndex,
		numPeople,
		errors,
	}: MemberFormProps) => {
		const handleChange = (field: keyof Member, value: string) => {
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
							{errors?.formErrors?.fieldErrors?.fullName && (
								<p className="text-red-500 text-xs mt-1">
									{errors.formErrors.fieldErrors.fullName[0]}
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
							{errors?.formErrors?.fieldErrors?.email && (
								<p className="text-red-500 text-xs mt-1">
									{errors.formErrors.fieldErrors.email[0]}
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
							{errors?.formErrors?.fieldErrors?.contactNumber && (
								<p className="text-red-500 text-xs mt-1">
									{errors.formErrors.fieldErrors.contactNumber[0]}
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
							{errors?.formErrors?.fieldErrors?.foodPreference && (
								<p className="text-red-500 text-xs mt-1">
									{errors.formErrors.fieldErrors.foodPreference[0]}
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
							{errors?.formErrors?.fieldErrors?.tshirtSize && (
								<p className="text-red-500 text-xs mt-1">
									{errors.formErrors.fieldErrors.tshirtSize[0]}
								</p>
							)}
						</div>
					</div>
				</div>
				<div className="flex justify-between mt-4">
					<Button onClick={prevStep} size="lg">
						<ArrowLeft className="w-4 h-4 mr-2" /> Back
					</Button>
					<Button onClick={nextStep} size="lg">
						{memberIndex === numPeople - 1 ? "Next" : "Next Member"}{" "}
						<ArrowRight className="w-4 h-4 ml-2" />
					</Button>
				</div>
			</div>
		);
	};

	interface Step3Props {
		prevStep: () => void;
		nextStep: () => void;
		setProjectFile: (file: string | null) => void;
	}

	const Step3 = ({ prevStep, nextStep, setProjectFile }: Step3Props) => {
		const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files ? e.target.files[0] : null;
			if (file) {
				const reader = new FileReader();
				reader.onloadend = () => {
					setProjectFile(reader.result as string); // Store Base64 string
				};
				reader.readAsDataURL(file);
			} else {
				setProjectFile(null);
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
					<Button onClick={prevStep} size="lg">
						<ArrowLeft className="w-4 h-4 mr-2" /> Back
					</Button>
					<Button onClick={nextStep} size="lg">
						Review <ArrowRight className="w-4 h-4 ml-2" />
					</Button>
				</div>
			</div>
		);
	};

	interface Step4Props {
		prevStep: () => void;
		teamData: TeamDetails;
		handleSubmit: () => Promise<void>;
	}

	const Step4 = ({ prevStep, teamData, handleSubmit }: Step4Props) => (
		<div>
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<CheckCircle className="w-6 h-6" />
						<CardTitle>Review Your Information</CardTitle>
					</div>
				</CardHeader>
				<CardContent>
					<div className="mb-4">
						<h4 className="font-semibold">Team Name</h4>
						<p>{teamData.teamName}</p>
					</div>
					<Separator />
					<div className="mt-4">
						<h4 className="font-semibold">Members</h4>
						{teamData.members.map((member: Member, index: number) => (
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
					<div className="mt-4">
						<h4 className="font-semibold">Project File</h4>
						<p>
							{teamData.projectFile ? "File uploaded (Base64)" : "Not provided"}
						</p>
					</div>
				</CardContent>
			</Card>
			<div className="flex justify-between mt-4">
				<Button onClick={prevStep} size="lg">
					<ArrowLeft className="w-4 h-4 mr-2" /> Back
				</Button>
				<Button onClick={handleSubmit} size="lg">
					Submit
				</Button>
			</div>
		</div>
	);

	export function RegistrationForm() {
		const [step, setStep] = useState(1);
		const [teamName, setTeamName] = useState("");
		const [numPeople, setNumPeople] = useState(3);
		const [members, setMembers] = useState<Member[]>([]);
		const [currentMember, setCurrentMember] = useState(0);
		const [projectFile, setProjectFile] = useState<string | null>(null);
		const [errors, setErrors] = useState<ZodError | null>(null);
		const { data: session, status } = useSession();
		const [isDialogOpen, setIsDialogOpen] = useState(false);
		const [existingTeamData, setExistingTeamData] = useState<TeamDetails | null>(
			null,
		);
		const [isLoadingTeamData, setIsLoadingTeamData] = useState(true);

		useEffect(() => {
			const fetchTeamDetails = async () => {
				if (session?.user?.id) {
					try {
						const response = await fetch(`/api/teams/${session.user.id}`);
						if (response.ok) {
							const data = await response.json();
							setExistingTeamData(data);
							setTeamName(data.teamName);
							setNumPeople(data.members.length);
							setMembers(data.members);
							setProjectFile(data.projectFile);
						} else if (response.status === 404) {
							setExistingTeamData(null);
						} else {
							toast.error("Failed to fetch existing team details.");
						}
					} catch (error: unknown) {
						console.error("Error fetching team details:", error);
						toast.error("An error occurred while fetching team details.");
					} finally {
						setIsLoadingTeamData(false);
					}
				} else {
					setIsLoadingTeamData(false);
				}
			};

			fetchTeamDetails();
		}, [session]);

		const updateMemberData = (index: number, data: Member) => {
			const newMembers = [...members];
			newMembers[index] = data;
			setMembers(newMembers);
			// Clear errors for the field being updated
			if (errors) {
				setErrors(null);
			}
		};

		const validateStep = () => {
			setErrors(null);
			if (step === 1) {
				if (!teamName.trim()) {
					setErrors(
						new ZodError([
							{
								path: ["teamName"],
								message: "Team name cannot be blank",
								code: "custom",
							},
						]),
					);
					return false;
				}
			} else if (step === 2) {
				const result = memberSchema.safeParse(members[currentMember]);
				if (!result.success) {
					setErrors(result.error);
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
			setErrors(null);
			if (step === 2 && currentMember > 0) {
				setCurrentMember(currentMember - 1);
			} else {
				setStep(step - 1);
			}
		};

		const handleSubmit = async () => {
			if (!validateStep()) return;

			const teamData: TeamDetails = {
				teamName,
				members,
				projectFile: projectFile,
				userId: session?.user?.id, // Include userId from session
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
			} catch (error: unknown) {
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
				setErrors(null);
			} else if (status === "unauthenticated") {
				toast.error("Please log in to register for the event.");
				return; // Prevent dialog from opening
			}
			setIsDialogOpen(open);
		};

		return (
			<Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
				<DialogTrigger asChild>
					<NeonGradientCard>
						<Button
							disabled={status === "loading" || isLoadingTeamData}
							className="w-full bg-[#CCB9B5] text-black"
							size="lg"
						>
							{isLoadingTeamData
								? "Loading..."
								: existingTeamData
									? "Update Details"
									: "Register Now"}
						</Button>
					</NeonGradientCard>
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
