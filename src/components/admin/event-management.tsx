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
import { createEventSchema, updateEventSchema, assignOrganiserSchema, assignJudgeSchema } from "@/lib/validators/event.validators";
import { ZodError } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EventParticipantsManagement } from "./event-participants-management";
import { EventJudgesManagement } from "./event-judges-management";
import { Textarea } from "@/components/ui/textarea"; // Import Textarea
import { Switch } from "@/components/ui/switch"; // Import Switch for isActive

interface Event {
  id: string;
  name: string;
  description: string;
  eventDate: string;
  location: string;
  poster?: string | null; // New poster field
  isActive: boolean; // New isActive field
}

interface EventDetails extends Event {
  eventsToOrganisers: { user: { id: string; name: string; email: string; image?: string | null; } }[];
  judges: { user: { id: string; name: string; email: string; image?: string | null; } }[];
  participants: { user: { id: string; name: string; email: string; image?: string | null; } }[]; // Added participants
}

interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

export function EventManagement() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isManageDetailsDialogOpen, setIsManageDetailsDialogOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [currentEventDetails, setCurrentEventDetails] = useState<EventDetails | null>(null);
  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
    eventDate: '',
    location: '',
    poster: '', // Initialize new fields
    isActive: true, // Initialize new fields
  });
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [searchUserResults, setSearchUserResults] = useState<User[]>([]);
  const [searchUserLoading, setSearchUserLoading] = useState(false);

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

  const fetchEventDetails = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setCurrentEventDetails(data.data);
      } else {
        toast.error(`Failed to fetch event details: ${data.error.message}`);
      }
    } catch (err: any) {
      toast.error(`Error fetching event details: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEditClick = (event: Event) => {
    setCurrentEvent(event);
    setIsEditDialogOpen(true);
  };

  const handleManageDetailsClick = (eventId: string) => {
    fetchEventDetails(eventId);
    setIsManageDetailsDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!currentEvent) return;

    try {
      const eventDateISO = new Date(currentEvent.eventDate).toISOString();
      const validatedData = updateEventSchema.parse({ ...currentEvent, eventDate: eventDateISO });

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
        fetchEvents();
      } else {
        toast.error(`Failed to update event: ${data.error.message}`);
      }
    } catch (err: any) {
      if (err instanceof ZodError) {
        toast.error(err.issues[0].message);
      } else if (err instanceof Error) {
        toast.error(`Error updating event: ${err.message}`);
      } else {
        toast.error("An unexpected error occurred.");
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
        fetchEvents();
      } else {
        toast.error(`Failed to delete event: ${data.error.message}`);
      }
    } catch (err: any) {
      toast.error(`Error deleting event: ${err.message}`);
    }
  };

  const handleAddEvent = async () => {
    try {
      const eventDateISO = new Date(newEvent.eventDate).toISOString();
      const validatedData = createEventSchema.parse({ ...newEvent, eventDate: eventDateISO });

      const response = await fetch('/api/events', {
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
        toast.success("Event added successfully!");
        setIsAddDialogOpen(false);
        setNewEvent({ name: '', description: '', eventDate: '', location: '', poster: '', isActive: true });
        fetchEvents();
      } else {
        toast.error(`Failed to add event: ${data.error.message}`);
      }
    } catch (err: any) {
      if (err instanceof ZodError) {
        toast.error(err.issues[0].message);
      } else if (err instanceof Error) {
        toast.error(`Error adding event: ${err.message}`);
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  const handleSearchUsers = async (query: string) => {
    setSearchUserLoading(true);
    try {
      const response = await fetch(`/api/users?search=${query}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setSearchUserResults(data.data);
      } else {
        toast.error(`Failed to search users: ${data.error.message}`);
      }
    } catch (err: any) {
      toast.error(`Error searching users: ${err.message}`);
    }
    finally {
      setSearchUserLoading(false);
    }
  };

  const handleAddOrganiser = async (userId: string) => {
    if (!currentEventDetails) return;
    try {
      const validatedData = assignOrganiserSchema.parse({ userId });
      const response = await fetch(`/api/events/${currentEventDetails.id}/organisers`, {
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
        fetchEventDetails(currentEventDetails.id); // Re-fetch details
      } else {
        toast.error(`Failed to add organiser: ${data.error.message}`);
      }
    } catch (err: any) {
      if (err instanceof ZodError) {
        toast.error(err.issues[0].message);
      } else {
        toast.error(`Error adding organiser: ${err.message}`);
      }
    }
  };

  const handleRemoveOrganiser = async (userId: string) => {
    if (!currentEventDetails) return;
    if (!confirm("Are you sure you want to remove this organiser?")) return;
    try {
      const validatedData = assignOrganiserSchema.parse({ userId });
      const response = await fetch(`/api/events/${currentEventDetails.id}/organisers`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        toast.success("Organiser removed successfully!");
        fetchEventDetails(currentEventDetails.id); // Re-fetch details
      } else {
        toast.error(`Failed to remove organiser: ${data.error.message}`);
      }
    } catch (err: any) {
      toast.error(`Error removing organiser: ${err.message}`);
    }
  };

  const handleAddJudge = async (userId: string) => {
    if (!currentEventDetails) return;
    try {
      const validatedData = assignJudgeSchema.parse({ userId });
      const response = await fetch(`/api/events/${currentEventDetails.id}/judges`, {
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
        fetchEventDetails(currentEventDetails.id); // Re-fetch details
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
    if (!currentEventDetails) return;
    if (!confirm("Are you sure you want to remove this judge?")) return;
    try {
      const validatedData = assignJudgeSchema.parse({ userId });
      const response = await fetch(`/api/events/${currentEventDetails.id}/judges`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        toast.success("Judge removed successfully!");
        fetchEventDetails(currentEventDetails.id); // Re-fetch details
      } else {
        toast.error(`Failed to remove judge: ${data.error.message}`);
      }
    } catch (err: any) {
      toast.error(`Error removing judge: ${err.message}`);
    }
  };

  if (loading) return <div>Loading events...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Manage Events</h3>
        <Button onClick={() => setIsAddDialogOpen(true)}>Add New Event</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id}><TableCell className="font-medium">{event.name}</TableCell><TableCell>{new Date(event.eventDate).toLocaleDateString()}</TableCell><TableCell>{event.location}</TableCell><TableCell>{event.isActive ? 'Yes' : 'No'}</TableCell><TableCell>
                <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditClick(event)}>
                  Edit
                </Button>
                <Button variant="secondary" size="sm" className="mr-2" onClick={() => handleManageDetailsClick(event.id)}>
                  Manage
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(event.id)}>
                  Delete
                </Button>
              </TableCell></TableRow>
          ))}
        </TableBody>
      </Table>

      {!loading && events.length === 0 && (
        <p className="text-center text-muted-foreground mt-4">No events found.</p>
      )}

      {currentEvent && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
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
                <Textarea
                  id="description"
                  value={currentEvent.description}
                  onChange={(e) => setCurrentEvent({ ...currentEvent, description: e.target.value })}
                  className="col-span-3 min-h-[80px]"
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="poster" className="text-right">
                  Poster URL
                </Label>
                <Input
                  id="poster"
                  value={currentEvent.poster || ''}
                  onChange={(e) => setCurrentEvent({ ...currentEvent, poster: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isActive" className="text-right">
                  Is Active
                </Label>
                <div className="col-span-3 flex items-center">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={currentEvent.isActive}
                    onChange={(e) => setCurrentEvent({ ...currentEvent, isActive: e.target.checked })}
                    className="h-4 w-4"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSaveEdit}>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Event Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
            <DialogDescription>
              Enter details for the new event.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-name" className="text-right">
                Name
              </Label>
              <Input
                id="add-name"
                value={newEvent.name}
                onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="add-description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                className="col-span-3 min-h-[80px]"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-eventDate" className="text-right">
                Date
              </Label>
              <Input
                id="add-eventDate"
                type="datetime-local"
                value={newEvent.eventDate}
                onChange={(e) => setNewEvent({ ...newEvent, eventDate: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-location" className="text-right">
                Location
              </Label>
              <Input
                id="add-location"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-poster" className="text-right">
                Poster URL
              </Label>
              <Input
                id="add-poster"
                value={newEvent.poster}
                onChange={(e) => setNewEvent({ ...newEvent, poster: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-isActive" className="text-right">
                Is Active
              </Label>
              <input
                id="add-isActive"
                type="checkbox"
                checked={newEvent.isActive}
                onChange={(e) => setNewEvent({ ...newEvent, isActive: e.target.checked })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleAddEvent}>Add Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Event Details Dialog */}
      {currentEventDetails && (
        <Dialog open={isManageDetailsDialogOpen} onOpenChange={setIsManageDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Manage Event: {currentEventDetails.name}</DialogTitle>
              <DialogDescription>
                Add or remove organisers and judges for this event.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Organisers Section */}
              <h4 className="text-lg font-semibold">Organisers</h4>
              <EventParticipantsManagement
                eventId={currentEventDetails.id}
                currentParticipants={currentEventDetails.participants} // Corrected prop
                onUpdate={() => fetchEventDetails(currentEventDetails.id)}
              />

              {/* Judges Section */}
              <h4 className="text-lg font-semibold mt-4">Judges</h4>
              <EventJudgesManagement
                eventId={currentEventDetails.id}
                currentJudges={currentEventDetails.judges}
                onUpdate={() => fetchEventDetails(currentEventDetails.id)}
              />

            </div>
            <DialogFooter>
              <Button onClick={() => setIsManageDetailsDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
