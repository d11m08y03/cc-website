"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

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
  onAddParticipant: (userId: string) => void;
  onRemoveParticipant: (userId: string) => void;
}

export function EventParticipantsManagement({
  eventId,
  currentParticipants,
  onUpdate,
  onAddParticipant,
  onRemoveParticipant,
}: EventParticipantsManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
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

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search current participants..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4"
      />
      <div className="flex flex-col gap-2 border rounded-md p-4">
        {currentParticipants.length > 0 ? (
          <>
            <Input
              placeholder="Search current participants..."
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
                {currentParticipants.filter(participant =>
                  participant.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  participant.user.email.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((p) => (
                  <TableRow key={p.user.id}>
                    <TableCell>{p.user.name}</TableCell>
                    <TableCell>{p.user.email}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onRemoveParticipant(p.user.id)}
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
          <p className="text-muted-foreground">No participants assigned to this event.</p>
        )}
      </div>
      <div className="flex space-x-2 mt-2">
        <Input
          placeholder="Search user to add as participant..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearchUsers();
          }}
        />
        <Button onClick={handleSearchUsers} disabled={searchLoading}>
          {searchLoading ? "Searching..." : "Search"}
        </Button>
      </div>
      {searchResults.length > 0 && (
        <div className="max-h-40 overflow-y-auto border rounded-md mt-2">
          <Table>
            <TableBody>
              {searchResults.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    {user.name} ({user.email})
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => onAddParticipant(user.id)}
                      disabled={currentParticipants.some(
                        (p) => p.user.id === user.id,
                      )}
                    >
                      {currentParticipants.some((p) => p.user.id === user.id)
                        ? "Already Participant"
                        : "Add as Participant"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {searchQuery && searchResults.length === 0 && !searchLoading && (
        <p className="text-center text-muted-foreground">
          No users found for search.
        </p>
      )}
    </div>
  );
}
