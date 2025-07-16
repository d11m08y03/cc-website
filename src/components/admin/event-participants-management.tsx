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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { assignParticipantSchema } from "@/lib/validators/event.validators"; // Assuming you'll create this schema
import { ZodError } from "zod";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

interface EventParticipantsManagementProps {
  eventId: string;
  currentParticipants: { user: User }[];
  onUpdate: () => void; // Callback to refresh parent's event details
}

export function EventParticipantsManagement({
  eventId,
  currentParticipants,
  onUpdate,
}: EventParticipantsManagementProps) {
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
    } catch (err: any) {
      toast.error(`Error searching users: ${err.message}`);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddParticipant = async (userId: string) => {
    try {
      const validatedData = assignParticipantSchema.parse({ userId });
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        toast.success("Participant added successfully!");
        onUpdate(); // Trigger parent to re-fetch event details
      } else {
        toast.error(`Failed to add participant: ${data.error.message}`);
      }
    } catch (err: any) {
      if (err instanceof ZodError) {
        toast.error(err.issues[0].message);
      } else {
        toast.error(`Error adding participant: ${err.message}`);
      }
    }
  };

  const handleRemoveParticipant = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this participant?")) return;
    try {
      // Assuming a DELETE endpoint for /api/events/[id]/participants
      const response = await fetch(`/api/events/${eventId}/participants`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        toast.success("Participant removed successfully!");
        onUpdate(); // Trigger parent to re-fetch event details
      } else {
        toast.error(`Failed to remove participant: ${data.error.message}`);
      }
    } catch (err: any) {
      toast.error(`Error removing participant: ${err.message}`);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold">Participants</h4>
      <div className="flex flex-col gap-2">
        {currentParticipants.length > 0 ? (
          currentParticipants.map((p) => (
            <div key={p.user.id} className="flex items-center justify-between border p-2 rounded-md">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={p.user.image || ''} alt={p.user.name || 'User'} />
                  <AvatarFallback>{p.user.name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <span>{p.user.name} ({p.user.email})</span>
              </div>
              <Button variant="destructive" size="sm" onClick={() => handleRemoveParticipant(p.user.id)}>
                Remove
              </Button>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground">No participants assigned to this event.</p>
        )}
      </div>
      <div className="flex space-x-2 mt-2">
        <Input
          placeholder="Search user to add as participant..."
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
                <TableRow key={user.id}><TableCell>{user.name} ({user.email})</TableCell><TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => handleAddParticipant(user.id)}
                      disabled={currentParticipants.some(p => p.user.id === user.id)}
                    >
                      {currentParticipants.some(p => p.user.id === user.id) ? 'Already Participant' : 'Add as Participant'}
                    </Button>
                  </TableCell></TableRow>
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
