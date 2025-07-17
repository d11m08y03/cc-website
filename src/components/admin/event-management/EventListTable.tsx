
"use client";

import React from "react";
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
import { Event } from "@/lib/types/event.types";

interface EventListTableProps {
  events: Event[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAddEventClick: () => void;
  onEditClick: (event: Event) => void;
  onManageDetailsClick: (eventId: string) => void;
  onDeleteClick: (eventId: string) => void;
  loading: boolean;
}

export function EventListTable({
  events,
  searchQuery,
  setSearchQuery,
  onAddEventClick,
  onEditClick,
  onManageDetailsClick,
  onDeleteClick,
  loading,
}: EventListTableProps) {
  const filteredEvents = events.filter(
    (event) =>
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Manage Events</h3>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <Button onClick={onAddEventClick}>Add New Event</Button>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEvents.map((event) => (
            <TableRow key={event.id}>
              <TableCell className="font-medium">{event.name}</TableCell>
              <TableCell>
                {new Date(event.startDate).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {new Date(event.endDate).toLocaleDateString()}
              </TableCell>
              <TableCell>{event.location}</TableCell>
              <TableCell>{event.isActive ? "Yes" : "No"}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  className="mr-2"
                  onClick={() => onEditClick(event)}
                >
                  Edit
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mr-2"
                  onClick={() => onManageDetailsClick(event.id)}
                >
                  Manage
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDeleteClick(event.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {!loading && events.length === 0 && (
        <p className="text-center text-muted-foreground mt-4">
          No events found.
        </p>
      )}
    </div>
  );
}
