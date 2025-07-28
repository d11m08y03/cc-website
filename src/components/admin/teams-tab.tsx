import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function TeamsTab() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team) => (
          <div key={team.id} className="border p-4 rounded-lg shadow-sm">
            <h3 className="font-bold text-lg mb-2">{team.teamName}</h3>
            <p className="text-sm text-muted-foreground">Project File: {team.projectFileName || "N/A"}</p>
            {team.projectFile && (
              <a href={team.projectFile} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">
                View Project File
              </a>
            )}
            <div className="mt-3">
              <label htmlFor={`status-${team.id}`} className="block text-sm font-medium text-gray-700 mb-1">Approval Status:</label>
              <Select onValueChange={(value) => handleStatusChange(team.id, value)} value={team.approvalStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <h4 className="font-semibold mt-4 mb-2">Members:</h4>
            <ul className="list-disc list-inside text-sm">
              {team.teamMembers.length > 0 ? (
                team.teamMembers.map((member: any) => (
                  <li key={member.id}>{member.fullName} ({member.role})</li>
                ))
              ) : (
                <li>No members found.</li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
