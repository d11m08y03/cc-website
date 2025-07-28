import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Mail, Phone, Utensils, Shirt, LeafyGreen, FileText, Eye, CheckCircle, XCircle, Clock, Users } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function TeamsTab() {
	const [teams, setTeams] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
	const [selectedTeamMembers, setSelectedTeamMembers] = useState<any[]>([]);

	const fetchTeams = () => {
		setLoading(true);
		fetch("/api/admin/teams")
			.then((res) => res.json())
			.then((data) => {
				console.log("API response for teams:", data);
				if (Array.isArray(data)) {
					setTeams(data);
				} else {
					console.error("API did not return an array for teams");
				}
			})
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		fetchTeams();
	}, []);

	const handleStatusChange = async (teamId: string, newStatus: string) => {
		try {
			const response = await fetch(`/api/admin/teams/${teamId}/status`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ status: newStatus }),
			});

			if (response.ok) {
				toast.success("Team status updated successfully!");
				fetchTeams(); // Re-fetch teams to update the UI
			} else {
				const errorData = await response.json();
				toast.error(`Failed to update status: ${errorData.error || response.statusText}`);
			}
		} catch (error) {
			console.error("Error updating team status:", error);
			toast.error("An unexpected error occurred.");
		}
	};

	const filteredTeams = teams.filter((team) => {
		const matchesSearch = team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			team.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			team.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
		return matchesSearch;
	});

	if (loading) {
		return (
			<div className="flex justify-center items-center h-32">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	return (
		<div>
			<Input
				placeholder="Search teams by name, leader name, or email..."
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
				className="mb-6"
			/>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{filteredTeams.map((team) => (
					<div key={team.id} className="border p-4 rounded-lg shadow-sm flex flex-col">
						<h3 className="font-bold text-lg mb-2">{team.teamName}</h3>

						{team.user && (
							<div className="flex items-center mb-3">
								<Avatar className="h-8 w-8 mr-2">
									<AvatarImage src={team.user.image || ""} alt={team.user.name || "Leader Avatar"} />
									<AvatarFallback>{team.user.name?.[0] || "L"}</AvatarFallback>
								</Avatar>
								<div>
									<p className="text-sm font-medium">Leader: {team.user.name}</p>
									<p className="text-xs text-muted-foreground">{team.user.email}</p>
								</div>
							</div>
						)}

						<p className="text-base font-medium text-foreground mb-1 flex items-center justify-between">
							<span>Project File: {team.projectFileName || "N/A"}</span>
							{team.projectFile && (
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<a href={team.projectFile} target="_blank" rel="noopener noreferrer" className="text-blue-500 cursor-pointer transition-transform hover:scale-110">
												<Eye className="h-4 w-4" />
											</a>
										</TooltipTrigger>
										<TooltipContent>
											<p>View Project File</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							)}
						</p>

						<div className="mt-auto flex items-center justify-between">
							<span className="block text-base font-medium text-foreground">Approval Status:</span>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										{team.approvalStatus === "approved" ? (
											<CheckCircle className="h-4 w-4 text-green-500" />
										) : team.approvalStatus === "rejected" ? (
											<XCircle className="h-4 w-4 text-red-500" />
										) : (
											<Clock className="h-4 w-4 text-yellow-500" />
										)}
									</TooltipTrigger>
									<TooltipContent>
										<p>{team.approvalStatus.charAt(0).toUpperCase() + team.approvalStatus.slice(1)}</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>

						<Button
							variant="outline"
							className="mt-4 w-fit ml-auto"
							onClick={() => {
								setSelectedTeamMembers(team.teamMembers);
								setIsMembersDialogOpen(true);
							}}
						>
							<Users className="h-4 w-4 mr-2" /> View Team Members ({team.teamMembers.length})
						</Button>
					</div>
				))}
			</div>

			<Dialog open={isMembersDialogOpen} onOpenChange={setIsMembersDialogOpen}>
				<DialogContent className="max-w-3xl">
					<DialogHeader>
						<DialogTitle>Team Members</DialogTitle>
						<DialogDescription>Details of all members in the team.</DialogDescription>
					</DialogHeader>
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Role</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Contact</TableHead>
									<TableHead>Food Preference</TableHead>
									<TableHead>T-Shirt Size</TableHead>
									<TableHead>Allergies</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{selectedTeamMembers.length > 0 ? (
									selectedTeamMembers.map((member: any) => (
										<TableRow key={member.id}>
											<TableCell className="font-medium">{member.fullName}</TableCell>
											<TableCell>{member.role}</TableCell>
											<TableCell>{member.email}</TableCell>
											<TableCell>{member.contactNumber}</TableCell>
											<TableCell>{member.foodPreference}</TableCell>
											<TableCell>{member.tshirtSize}</TableCell>
											<TableCell>{member.allergies || "N/A"}</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell colSpan={7} className="text-center">No members found.</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
					<DialogFooter>
						<DialogClose asChild>
							<Button type="button" variant="secondary">
								Close
							</Button>
						</DialogClose>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
