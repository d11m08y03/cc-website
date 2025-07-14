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
import { createEventSchema, updateEventSchema } from "@/lib/validators/event.validators";
import { ZodError } from "zod";

interface Event {
  id: string;
  name: string;
  description: string;
  eventDate: string;
  location: string;
}

export function EventManagement() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setEvents(data.data);
      } else {
        setError(data.error.message);
        toast.error(`Failed to fetch events: ${data.error.message}`);
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(`Error fetching events: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEditClick = (event: Event) => {
    setCurrentEvent(event);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!currentEvent) return;

    try {
      const validatedData = updateEventSchema.parse(currentEvent);
      const response = await fetch(`/api/events/${currentEvent.id}`, {
        method: 'PUT',
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
        toast.success("Event updated successfully!");
        setIsEditDialogOpen(false);
        fetchEvents(); // Re-fetch events to update the list
      } else {
        toast.error(`Failed to update event: ${data.error.message}`);
      }
    } catch (err: any) {
      if (err instanceof ZodError) {
        toast.error(err.issues[0].message);
      } else {
        toast.error(`Error updating event: ${err.message}`);
      }
    }
  };

  const handleDeleteClick = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        toast.success("Event deleted successfully!");
        fetchEvents(); // Re-fetch events to update the list
      } else {
        toast.error(`Failed to delete event: ${data.error.message}`);
      }
    } catch (err: any) {
      toast.error(`Error deleting event: ${err.message}`);
    }
  };

  if (loading) return <div>Loading events...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Manage Events</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell className="font-medium">{event.name}</TableCell>
              <TableCell>{new Date(event.eventDate).toLocaleDateString()}</TableCell>
              <TableCell>{event.location}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditClick(event)}>
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(event.id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {!loading && events.length === 0 && (
        <p className="text-center text-muted-foreground mt-4">No events found.</p>
      )}

      {currentEvent && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
              <DialogDescription>
                Make changes to the event here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={currentEvent.name}
                  onChange={(e) => setCurrentEvent({ ...currentEvent, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  value={currentEvent.description}
                  onChange={(e) => setCurrentEvent({ ...currentEvent, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="eventDate" className="text-right">
                  Date
                </Label>
                <Input
                  id="eventDate"
                  type="datetime-local"
                  value={new Date(currentEvent.eventDate).toISOString().slice(0, 16)}
                  onChange={(e) => setCurrentEvent({ ...currentEvent, eventDate: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Location
                </Label>
                <Input
                  id="location"
                  value={currentEvent.location}
                  onChange={(e) => setCurrentEvent({ ...currentEvent, location: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSaveEdit}>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}