"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  createEventSchema,
  updateEventSchema,
} from "@/lib/validators/event.validators";
import { Event, EventDetails } from "@/lib/types/event.types";
import { EventListTable } from "./event-management/EventListTable";
import { AddEventDialog } from "./event-management/AddEventDialog";
import { EditEventDialog } from "./event-management/EditEventDialog";
import { ManageEventDetailsDialog } from "./event-management/ManageEventDetailsDialog";

export function EventManagement() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isManageDetailsDialogOpen, setIsManageDetailsDialogOpen] =
    useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [currentEventDetails, setCurrentEventDetails] =
    useState<EventDetails | null>(null);
  const [newEvent, setNewEvent] = useState<Omit<Event, "id">>({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    poster: "",
    isActive: true,
  });

  const [searchQuery, setSearchQuery] = useState("");

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/events");
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
      const startDateISO = new Date(currentEvent.startDate).toISOString();
      const endDateISO = new Date(currentEvent.endDate).toISOString();
      const validatedData = updateEventSchema.parse({
        ...currentEvent,
        startDate: startDateISO,
        endDate: endDateISO,
      });

      const response = await fetch(`/api/events/${currentEvent.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
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
        method: "DELETE",
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
      const startDateISO = new Date(newEvent.startDate).toISOString();
      const endDateISO = new Date(newEvent.endDate).toISOString();
      const validatedData = createEventSchema.parse({
        ...newEvent,
        startDate: startDateISO,
        endDate: endDateISO,
      });

      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
        setNewEvent({
          name: "",
          description: "",
          startDate: "",
          endDate: "",
          location: "",
          poster: "",
          isActive: true,
        });
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

  if (loading) return <div>Loading events...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <EventListTable
        events={events}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onAddEventClick={() => setIsAddDialogOpen(true)}
        onEditClick={handleEditClick}
        onManageDetailsClick={handleManageDetailsClick}
        onDeleteClick={handleDeleteClick}
        loading={loading}
      />

      <AddEventDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        newEvent={newEvent}
        setNewEvent={setNewEvent}
        onAddEvent={handleAddEvent}
      />

      <EditEventDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        currentEvent={currentEvent}
        setCurrentEvent={setCurrentEvent as any}
        onSaveEdit={handleSaveEdit}
      />

      <ManageEventDetailsDialog
        isOpen={isManageDetailsDialogOpen}
        onOpenChange={setIsManageDetailsDialogOpen}
        currentEventDetails={currentEventDetails}
        fetchEventDetails={fetchEventDetails}
      />
    </div>
  );
}