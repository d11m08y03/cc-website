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

interface Event {
  id: string;
  name: string;
  description: string;
  eventDate: string;
  location: string;
}

interface EventDetails extends Event {
  eventsToOrganisers: { user: { id: string; name: string; email: string; image?: string | null; } }[];
  judges: { user: { id: string; name: string; email: string; image?: string | null; } }[];
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
        setNewEvent({ name: '', description: '', eventDate: '', location: '' });
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
    } finally {
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
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id}><TableCell className="font-medium">{event.name}</TableCell><TableCell>{new Date(event.eventDate).toLocaleDateString()}</TableCell><TableCell>{event.location}</TableCell><TableCell>
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

      {/* Add Event Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
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
              <Input
                id="add-description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                className="col-span-3"
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
              <div className="flex flex-col gap-2">
                {currentEventDetails.eventsToOrganisers.length > 0 ? (
                  currentEventDetails.eventsToOrganisers.map((org) => (
                    <div key={org.user.id} className="flex items-center justify-between border p-2 rounded-md">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={org.user.image || ''} alt={org.user.name || 'User'} />
                          <AvatarFallback>{org.user.name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <span>{org.user.name} ({org.user.email})</span>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => handleRemoveOrganiser(org.user.id)}>
                        Remove
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No organisers assigned to this event.</p>
                )}
              </div>
              <div className="flex space-x-2 mt-2">
                <Input
                  placeholder="Search user to add as organiser..."
                  value={searchUserQuery}
                  onChange={(e) => setSearchUserQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearchUsers(searchUserQuery);
                  }}
                />
                <Button onClick={() => handleSearchUsers(searchUserQuery)} disabled={searchUserLoading}>
                  {searchUserLoading ? 'Searching...' : 'Search'}
                </Button>
              </div>
              {searchUserResults.length > 0 && (
                <div className="max-h-40 overflow-y-auto border rounded-md mt-2">
                  <Table>
                    <TableBody>
                      {searchUserResults.map((user) => (
                        <TableRow key={user.id}><TableCell>{user.name} ({user.email})</TableCell><TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={() => handleAddOrganiser(user.id)}
                              disabled={currentEventDetails.eventsToOrganisers.some(org => org.user.id === user.id)}
                            >
                              {currentEventDetails.eventsToOrganisers.some(org => org.user.id === user.id) ? 'Already Organiser' : 'Add as Organiser'}
                            </Button>
                          </TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              {searchUserQuery && searchUserResults.length === 0 && !searchUserLoading && (
                <p className="text-center text-muted-foreground">No users found for search.</p>
              )}

              {/* Judges Section */}
              <h4 className="text-lg font-semibold mt-4">Judges</h4>
              <div className="flex flex-col gap-2">
                {currentEventDetails.judges.length > 0 ? (
                  currentEventDetails.judges.map((judge) => (
                    <div key={judge.user.id} className="flex items-center justify-between border p-2 rounded-md">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={judge.user.image || ''} alt={judge.user.name || 'User'} />
                          <AvatarFallback>{judge.user.name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <span>{judge.user.name} ({judge.user.email})</span>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => handleRemoveJudge(judge.user.id)}>
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
                  value={searchUserQuery}
                  onChange={(e) => setSearchUserQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearchUsers(searchUserQuery);
                  }}
                />
                <Button onClick={() => handleSearchUsers(searchUserQuery)} disabled={searchUserLoading}>
                  {searchUserLoading ? 'Searching...' : 'Search'}
                </Button>
              </div>
              {searchUserResults.length > 0 && (
                <div className="max-h-40 overflow-y-auto border rounded-md mt-2">
                  <Table>
                    <TableBody>
                      {searchUserResults.map((user) => (
                        <TableRow key={user.id}><TableCell>{user.name} ({user.email})</TableCell><TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={() => handleAddJudge(user.id)}
                              disabled={currentEventDetails.judges.some(j => j.user.id === user.id)}
                            >
                              {currentEventDetails.judges.some(j => j.user.id === user.id) ? 'Already Judge' : 'Add as Judge'}
                            </Button>
                          </TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              {searchUserQuery && searchUserResults.length === 0 && !searchUserLoading && (
                <p className="text-center text-muted-foreground">No users found for search.</p>
              )}

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
