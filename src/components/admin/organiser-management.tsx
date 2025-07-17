'use client';

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { setOrganiserStatusSchema } from "@/lib/validators/organiser.validators";
import { ZodError } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";

// Updated interface to reflect User type for organisers
interface UserAsOrganiser {
  id: string;
  name: string;
  email: string;
  image?: string | null; // Profile picture URL from OAuth
  isOrganiser: boolean;
}

export function OrganiserManagement() {
  const [organisers, setOrganisers] = useState<UserAsOrganiser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserAsOrganiser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserAsOrganiser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const fetchOrganisers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/organisers');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setOrganisers(data.data);
      } else {
        setError(data.error.message);
        toast.error(`Failed to fetch organisers: ${data.error.message}`);
      }
    } catch (err: Error) {
      setError(err.message);
      toast.error(`Error fetching organisers: ${err.message}`);
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganisers();
  }, []);

  const handleToggleOrganiserStatus = async (user: UserAsOrganiser, newStatus: boolean) => {
    try {
      const validatedData = setOrganiserStatusSchema.parse({
        userId: user.id,
        isOrganiser: newStatus,
      });
      const response = await fetch('/api/organisers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        toast.success(`Organiser status updated for ${user.name} to ${newStatus ? 'true' : 'false'} !`);
        fetchOrganisers(); // Re-fetch organisers to update the list
        setIsEditDialogOpen(false);
        if (newStatus) { // Close add dialog only when setting as organiser
          setIsAddDialogOpen(false);
        }
      } else {
        toast.error(`Failed to update organiser status: ${data.error.message}`);
      }
    } catch (err: Error) {
      if (err instanceof ZodError) {
        toast.error(err.issues[0].message);
      } else {
        toast.error(`Error updating organiser status: ${err.message}`);
      }
    }
  };

  const handleSearchUsers = async () => {
    if (!searchQuery) return;
    setSearchLoading(true);
    try {
      const response = await fetch(`/api/users?search=${searchQuery}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setSearchResults(data.data);
      } else {
        toast.error(`Failed to search users: ${data.error.message}`);
      }
    } catch (err: Error) {
      toast.error(`Error searching users: ${err.message}`);
    }
    finally {
      setSearchLoading(false);
    }
  };

  if (loading) return <div>Loading organisers...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Manage Organisers</h3>
        <Button onClick={() => setIsAddDialogOpen(true)}>Set User as Organiser</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Profile Pic</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {organisers.map((organiser) => (
            <TableRow key={organiser.id}><TableCell className="font-medium">{organiser.name}</TableCell><TableCell>{organiser.email}</TableCell><TableCell>
                <Avatar className="h-9 w-9">
                  <AvatarImage src={organiser.image || ''} alt={organiser.name || 'User'} />
                  <AvatarFallback>{organiser.name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
              </TableCell><TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleToggleOrganiserStatus(organiser, false)}
                >
                  Remove as Organiser
                </Button>
              </TableCell></TableRow>
          ))}
        </TableBody>
      </Table>

      {!loading && organisers.length === 0 && (
        <p className="text-center text-muted-foreground mt-4">No organisers found.</p>
      )}

      {/* Edit Organiser Status Dialog */}
      {currentUser && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Organiser Status</DialogTitle>
              <DialogDescription>
                Toggle {currentUser.name}&apos;s organiser status.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="is-organiser">Is Organiser</Label>
                <Switch
                  id="is-organiser"
                  checked={currentUser.isOrganiser}
                  onCheckedChange={(checked) =>
                    setCurrentUser({ ...currentUser, isOrganiser: checked })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => handleToggleOrganiserStatus(currentUser, currentUser.isOrganiser)}>
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Set User as Organiser Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Set User as Organiser</DialogTitle>
            <DialogDescription>
              Search for a user and set their organiser status.
            </DialogDescription>
          </DialogHeader>
          <div className="flex space-x-2 py-4">
            <Input
              placeholder="Search user by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearchUsers();
              }}
            />
            <Button onClick={handleSearchUsers} disabled={searchLoading}>
              {searchLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>
          {searchResults.length > 0 ? (
            <div className="max-h-60 overflow-y-auto border rounded-md mt-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResults.map((user) => (
                    <TableRow key={user.id}><TableCell>{user.name}</TableCell><TableCell>{user.email}</TableCell><TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleOrganiserStatus(user, true)}
                          disabled={user.isOrganiser} // Disable if already an organiser
                        >
                          {user.isOrganiser ? 'Already Organiser' : 'Set as Organiser'}
                        </Button>
                      </TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            searchQuery && !searchLoading && (
              <p className="text-center text-muted-foreground">No users found.</p>
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}