import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAdmin, setFilterAdmin] = useState("all");
  const [filterJudge, setFilterJudge] = useState("all");
  const [loadingStates, setLoadingStates] = useState<Map<string, boolean>>(new Map());
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        console.log("API response for users:", data);
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error("API did not return an array for users");
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleJudgeStatus = async (userId: string, currentStatus: boolean) => {
    setLoadingStates((prev) => new Map(prev).set(userId, true));
    try {
      const response = await fetch(`/api/admin/users/${userId}/judge`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isJudge: !currentStatus }),
      });

      if (response.ok) {
        toast.success(`User judge status updated successfully!`);
        fetchUsers(); // Re-fetch users to update the UI
      } else {
        const errorData = await response.json();
        toast.error(`Failed to update judge status: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error("Error toggling judge status:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setLoadingStates((prev) => {
        const newMap = new Map(prev);
        newMap.delete(userId);
        return newMap;
      });
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAdminFilter = filterAdmin === "all" ||
                               (filterAdmin === "yes" && user.isAdmin) ||
                               (filterAdmin === "no" && !user.isAdmin);

    const matchesJudgeFilter = filterJudge === "all" ||
                               (filterJudge === "yes" && user.isJudge) ||
                               (filterJudge === "no" && !user.isJudge);

    return matchesSearch && matchesAdminFilter && matchesJudgeFilter;
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
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <Select value={filterAdmin} onValueChange={setFilterAdmin}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Admin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Admins</SelectItem>
            <SelectItem value="yes">Is Admin</SelectItem>
            <SelectItem value="no">Not Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterJudge} onValueChange={setFilterJudge}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Judge" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Judges</SelectItem>
            <SelectItem value="yes">Is Judge</SelectItem>
            <SelectItem value="no">Not Judge</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => (
          <div key={user.id} className="border p-4 rounded-lg shadow-sm flex flex-col items-start">
            <div className="flex items-center mb-4">
              <Avatar className="h-12 w-12 mr-4">
                <AvatarImage src={user.image || ""} alt={user.name || "User Avatar"} />
                <AvatarFallback>{user.name?.[0] || "CN"}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-lg">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex space-x-4 mb-4">
              <p className="text-sm flex items-center">
                Admin: {user.isAdmin ? <CheckCircle className="h-4 w-4 text-green-500 ml-1" /> : <XCircle className="h-4 w-4 text-red-500 ml-1" />}
              </p>
              <p className="text-sm flex items-center">
                Judge: {user.isJudge ? <CheckCircle className="h-4 w-4 text-green-500 ml-1" /> : <XCircle className="h-4 w-4 text-red-500 ml-1" />}
              </p>
            </div>
            <Button
              onClick={() => toggleJudgeStatus(user.id, user.isJudge)}
              className="mt-auto"
              variant={user.isJudge ? "destructive" : "default"}
              disabled={loadingStates.get(user.id)}
            >
              {loadingStates.get(user.id) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {user.isJudge ? "Remove Judge" : "Make Judge"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

