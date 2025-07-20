"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User, Users, FileText, Loader2, XCircle } from "lucide-react";

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
  teamMembers: TeamMember[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [teamData, setTeamData] = useState<TeamDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        <p className="text-lg text-muted-foreground text-center">No team data available. Please register your team.</p>
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
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-3">
          {teamData?.teamName} Dashboard
        </h1>
        <p className="text-lg text-muted-foreground">
          Overview of your team and project submission.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Team Leader Card */}
        {teamLeader && (
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">Team Leader</CardTitle>
              <User className="h-8 w-8 text-primary" />
            </CardHeader>
            <CardContent className="pt-4 space-y-2 text-muted-foreground">
              <p><strong>Full Name:</strong> {teamLeader.fullName}</p>
              <p><strong>Email:</strong> {teamLeader.email}</p>
              <p><strong>Contact:</strong> {teamLeader.contactNumber}</p>
              <p><strong>Food Preference:</strong> {teamLeader.foodPreference}</p>
              <p><strong>T-Shirt Size:</strong> {teamLeader.tshirtSize}</p>
              {teamLeader.allergies && (
                <p><strong>Allergies:</strong> {teamLeader.allergies}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Other Members Cards */}
        {otherMembers && otherMembers.length > 0 && (
          otherMembers.map((member, index) => (
            <Card key={member.id || index} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold">Member {index + 1}</CardTitle>
                <User className="h-8 w-8 text-primary" />
              </CardHeader>
              <CardContent className="pt-4 space-y-2 text-muted-foreground">
                <p><strong>Full Name:</strong> {member.fullName}</p>
                <p><strong>Email:</strong> {member.email}</p>
                <p><strong>Contact:</strong> {member.contactNumber}</p>
                <p><strong>Food Preference:</strong> {member.foodPreference}</p>
                <p><strong>T-Shirt Size:</strong> {member.tshirtSize}</p>
                {member.allergies && (
                  <p><strong>Allergies:</strong> {member.allergies}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}

        {/* Project File Card */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">Project Submission</CardTitle>
            <FileText className="h-8 w-8 text-primary" />
          </CardHeader>
          <CardContent className="pt-4 space-y-2 text-muted-foreground">
            {teamData?.projectFile ? (
              <>
                <p><strong>Status:</strong> Submitted</p>
                <p><strong>File Name:</strong> {teamData.projectFileName}</p>
                {/* You might add a download link here if projectFile is a URL or can be converted */}
              </>
            ) : (
              <p><strong>Status:</strong> Not yet submitted</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
