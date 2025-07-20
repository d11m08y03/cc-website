"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  User,
  Users,
  FileText,
  Loader2,
  XCircle,
  Download,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  Utensils,
  Shirt,
  Pencil,
  UserPlus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RegistrationForm } from "@/components/upcoming-event/RegistrationForm";
import { AddTeamMemberForm } from "@/components/add-team-member-form";
import { ChangeProposalForm } from "@/components/change-proposal-form";
import { EditTeamMemberForm } from "@/components/edit-team-member-form";

interface TeamMember {
  id: string;
  teamId: string;
  userId: string | null;
  role: string;
  fullName: string;
  email: string;
  contactNumber: string;
  foodPreference: string;
  tshirtSize: string;
  allergies?: string;
}

interface TeamDetails {
  id: string;
  teamName: string;
  projectFile: string | null;
  projectFileName: string | null;
  userId: string;
  approvalStatus: "pending" | "approved" | "rejected";
  teamMembers: TeamMember[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [teamData, setTeamData] = useState<TeamDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteMember = async (memberId: string) => {
    if (!window.confirm("Are you sure you want to delete this team member?")) {
      return;
    }

    try {
      const response = await fetch(`/api/team-members/${memberId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Team member deleted successfully!");
        fetchTeamDetails(); // Refresh the team data
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to delete team member.");
      }
    } catch (error) {
      console.error("Error deleting team member:", error);
      toast.error("An unexpected error occurred while deleting the member.");
    }
  };

  const fetchTeamDetails = async () => {
    try {
      const response = await fetch("/api/team-details");
      if (response.ok) {
        const data = await response.json();
        setTeamData(data);
      } else if (response.status === 404) {
        setError("Team not found. Please register your team.");
        toast.info("Team not found. Please register your team.");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to fetch team details.");
        toast.error(errorData.message || "Failed to fetch team details.");
      }
    } catch (err) {
      console.error("Error fetching team details:", err);
      setError("An unexpected error occurred.");
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/"); // Redirect to home if not logged in
      toast.error("Please log in to view your dashboard.");
      return;
    }

    fetchTeamDetails();
  }, [session, status, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading team details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4 text-red-500">
        <XCircle className="h-12 w-12 mb-4" />
        <p className="text-lg text-center">{error}</p>
      </div>
    );
  }

  if (!teamData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4">
        <Users className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg text-muted-foreground text-center">
          No team data available. Please register your team.
        </p>
      </div>
    );
  }

  const teamLeader = teamData?.teamMembers.find(
    (member) => member.role === "leader",
  );
  const otherMembers = teamData?.teamMembers.filter(
    (member) => member.role !== "leader",
  );

  return (
    <div className="container mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-3">
          {teamData?.teamName} Dashboard
        </h1>
        <p className="text-lg text-muted-foreground">
          Overview of your team and project submission.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Team Overview Card */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="pt-2">
            <p className="flex items-center gap-2 text-2xl font-extrabold text-primary mb-2">
              <UserPlus className="h-8 w-8 text-primary" /> {teamData?.teamName}
            </p>
            <p className="text-lg text-muted-foreground">
              Total Members: {teamData?.teamMembers.length}
            </p>
            {/* Add an edit button for team details here if needed later */}
          </CardContent>
        </Card>

        {/* Registration Status Card */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="pt-2">
            <p className="flex items-center gap-2 text-3xl font-extrabold mb-2">
              {teamData?.approvalStatus === "approved" ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : teamData?.approvalStatus === "rejected" ? (
                <XCircle className="h-8 w-8 text-red-500" />
              ) : (
                <Clock className="h-8 w-8 text-yellow-500" />
              )}
              <span
                className={
                  teamData?.approvalStatus === "approved"
                    ? "text-green-500"
                    : teamData?.approvalStatus === "rejected"
                      ? "text-red-500"
                      : "text-yellow-500"
                }
              >
                {teamData?.approvalStatus.toUpperCase()}
              </span>
            </p>
            <p className="text-sm text-muted-foreground">
              Your team's registration approval status.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Team Leader Card */}
        {teamLeader && (
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <User className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl font-bold">
                  Team Leader
                </CardTitle>
              </div>
              <div className="flex gap-2">
                <EditTeamMemberForm
                  memberData={teamLeader}
                  onMemberUpdated={fetchTeamDetails}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteMember(teamLeader.id)}
                  disabled
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              <p className="flex items-center gap-2">
                <strong>Name:</strong> {teamLeader.fullName}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-green-500" />{" "}
                <strong>Contact:</strong> {teamLeader.contactNumber}
              </p>
              <p className="flex items-center gap-2">
                <Utensils className="h-4 w-4 text-yellow-500" />{" "}
                <strong>Food Preference:</strong> {teamLeader.foodPreference}
              </p>
              <p className="flex items-center gap-2">
                <Shirt className="h-4 w-4 text-purple-500" />{" "}
                <strong>T-Shirt Size:</strong> {teamLeader.tshirtSize}
              </p>
              {teamLeader.allergies && (
                <p className="flex items-center gap-2">
                  <strong>Allergies:</strong> {teamLeader.allergies}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Other Members Cards */}
        {otherMembers &&
          otherMembers.length > 0 &&
          otherMembers.map((member, index) => (
            <Card
              key={member.id || index}
              className="shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                  <User className="h-8 w-8 text-primary" />
                  <CardTitle className="text-2xl font-bold">
                    Member {index + 1}
                  </CardTitle>
                </div>
                <div className="flex gap-2">
                  <EditTeamMemberForm
                    memberData={member}
                    onMemberUpdated={fetchTeamDetails}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteMember(member.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                <p className="flex items-center gap-2">
                  <strong>Name:</strong> {member.fullName}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-green-500" />{" "}
                  <strong>Contact:</strong> {member.contactNumber}
                </p>
                <p className="flex items-center gap-2">
                  <Utensils className="h-4 w-4 text-yellow-500" />{" "}
                  <strong>Food Preference:</strong> {member.foodPreference}
                </p>
                <p className="flex items-center gap-2">
                  <Shirt className="h-4 w-4 text-purple-500" />{" "}
                  <strong>T-Shirt Size:</strong> {member.tshirtSize}
                </p>
                {member.allergies && (
                  <p className="flex items-center gap-2">
                    <strong>Allergies:</strong> {member.allergies}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
      </div>

      {/* New row for Project Submission and new button */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Project Submission Card */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-2xl font-bold">
              Project Submission
            </CardTitle>
            <FileText className="h-8 w-8 text-primary" />
          </CardHeader>
          <CardContent className="pt-4 space-y-2 text-muted-foreground">
            {teamData?.projectFile ? (
              <>
                <p>
                  <strong>Status:</strong> Submitted
                </p>
                <p>
                  <strong>File Name:</strong> {teamData.projectFileName}
                </p>
                <Button
                  onClick={() => {
                    if (teamData.projectFile && teamData.projectFileName) {
                      const link = document.createElement("a");
                      link.href = teamData.projectFile;
                      link.download = teamData.projectFileName;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    } else {
                      toast.error("Project file not available for download.");
                    }
                  }}
                  className="mt-4"
                >
                  <Download className="h-4 w-4 mr-2" /> Download File
                </Button>
              </>
            ) : (
              <p>
                <strong>Status:</strong> Not yet submitted
              </p>
            )}
          </CardContent>
        </Card>

        {/* New Button Card */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 lg:col-span-2 flex flex-col items-center justify-center p-4">
          <CardContent className="w-full h-full flex flex-row items-center justify-center gap-4 p-0">
            {teamData && (
              <ChangeProposalForm
                teamId={teamData.id}
                initialProjectFile={teamData.projectFile}
                initialProjectFileName={teamData.projectFileName}
                onProposalChanged={fetchTeamDetails}
              />
            )}
            {teamData && (
              <AddTeamMemberForm
                teamId={teamData.id}
                currentMemberCount={teamData.teamMembers.length}
                onMemberAdded={fetchTeamDetails}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
