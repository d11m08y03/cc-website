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
import { assignJudgeSchema } from "@/lib/validators/event.validators";
import { ZodError } from "zod";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

interface EventJudgesManagementProps {
  eventId: string;
  currentJudges: { user: User }[];
  onUpdate: () => void; // Callback to refresh parent's event details
}

export function EventJudgesManagement({
  eventId,
  currentJudges,
  onUpdate,
}: EventJudgesManagementProps) {
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

  const handleAddJudge = async (userId: string) => {
    try {
      const validatedData = assignJudgeSchema.parse({ userId });
      const response = await fetch(`/api/events/${eventId}/judges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        toast.success("Judge added successfully!");
        onUpdate(); // Trigger parent to re-fetch event details
      } else {
        toast.error(`Failed to add judge: ${data.error.message}`);
      }
    } catch (err: any) {
      if (err instanceof ZodError) {
        toast.error(err.issues[0].message);
      } else {
        toast.error(`Error adding judge: ${err.message}`);
      }
    }
  };

  const handleRemoveJudge = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this judge?")) return;
    try {
      const response = await fetch(`/api/events/${eventId}/judges`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        toast.success("Judge removed successfully!");
        onUpdate(); // Trigger parent to re-fetch event details
      } else {
        toast.error(`Failed to remove judge: ${data.error.message}`);
      }
    } catch (err: any) {
      toast.error(`Error removing judge: ${err.message}`);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold">Judges</h4>
      <div className="flex flex-col gap-2">
        {currentJudges.length > 0 ? (
          currentJudges.map((j) => (
            <div key={j.user.id} className="flex items-center justify-between border p-2 rounded-md">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={j.user.image || ''} alt={j.user.name || 'User'} />
                  <AvatarFallback>{j.user.name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <span>{j.user.name} ({j.user.email})</span>
              </div>
              <Button variant="destructive" size="sm" onClick={() => handleRemoveJudge(j.user.id)}>
                Remove
              </Button>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground">No judges assigned to this event.</p>
        )}
      </div>
      <div className="flex space-x-2 mt-2">
        <Input
          placeholder="Search user to add as judge..."
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
                      onClick={() => handleAddJudge(user.id)}
                      disabled={currentJudges.some(j => j.user.id === user.id)}
                    >
                      {currentJudges.some(j => j.user.id === user.id) ? 'Already Judge' : 'Add as Judge'}
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
