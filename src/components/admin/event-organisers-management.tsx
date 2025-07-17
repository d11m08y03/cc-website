'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { assignOrganiserSchema } from "@/lib/validators/event.validators";
import { ZodError } from "zod";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

interface EventOrganisersManagementProps {
  eventId: string;
  currentOrganisers: { user: User }[];
  onUpdate: () => void; // Callback to refresh parent's event details
}

export function EventOrganisersManagement({
  eventId,
  currentOrganisers,
  onUpdate,
}: EventOrganisersManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

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
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddOrganiser = async (userId: string) => {
    try {
      const validatedData = assignOrganiserSchema.parse({ userId });
      const response = await fetch(`/api/events/${eventId}/organisers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        toast.success("Organiser added successfully!");
        onUpdate(); // Trigger parent to re-fetch event details
      } else {
        toast.error(`Failed to add organiser: ${data.error.message}`);
      }
    } catch (err: Error) {
      if (err instanceof ZodError) {
        toast.error(err.issues[0].message);
      } else {
        toast.error(`Error adding organiser: ${err.message}`);
      }
    }
  };

  const handleRemoveOrganiser = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this organiser?")) return;
    try {
      const response = await fetch(`/api/events/${eventId}/organisers`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        toast.success("Organiser removed successfully!");
        onUpdate(); // Trigger parent to re-fetch event details
      } else {
        toast.error(`Failed to remove organiser: ${data.error.message}`);
      }
    } catch (err: Error) {
      toast.error(`Error removing organiser: ${err.message}`);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search current organisers..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4"
      />
      <div className="flex flex-col gap-2 border rounded-md p-4">
        {currentOrganisers.length > 0 ? (
          <>
            <Input
              placeholder="Search current organisers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4"
            />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentOrganisers.filter(organiser =>
                  organiser.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  organiser.user.email.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((o) => (
                  <TableRow key={o.user.id}>
                    <TableCell>{o.user.name}</TableCell>
                    <TableCell>{o.user.email}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveOrganiser(o.user.id)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        ) : (
          <p className="text-muted-foreground">No organisers assigned to this event.</p>
        )}
      </div>
      <div className="flex space-x-2 mt-2">
        <Input
          placeholder="Search user to add as organiser..."
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
      {searchResults.length > 0 && (
        <div className="max-h-40 overflow-y-auto border rounded-md mt-2">
          <Table>
            <TableBody>
              {searchResults.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name} ({user.email})</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => handleAddOrganiser(user.id)}
                      disabled={currentOrganisers.some((o) => o.user.id === user.id)}
                    >
                      {currentOrganisers.some((o) => o.user.id === user.id)
                        ? 'Already Organiser'
                        : 'Add as Organiser'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {searchQuery && searchResults.length === 0 && !searchLoading && (
        <p className="text-center text-muted-foreground">No users found for search.</p>
      )}
    </div>
  );
}
