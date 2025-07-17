"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventDetails } from "@/lib/types/event.types";
import { toast } from "sonner";
import {
  assignOrganiserSchema,
  assignJudgeSchema,
  assignParticipantSchema,
} from "@/lib/validators/event.validators";
import { ZodError } from "zod";
import { EventOrganisersManagement } from "../event-organisers-management";
import { EventJudgesManagement } from "../event-judges-management";
import { EventParticipantsManagement } from "../event-participants-management";

interface ManageEventDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentEventDetails: EventDetails | null;
  fetchEventDetails: (eventId: string) => void;
}

export function ManageEventDetailsDialog({
  isOpen,
  onOpenChange,
  currentEventDetails,
  fetchEventDetails,
}: ManageEventDetailsDialogProps) {
  if (!currentEventDetails) return null;

  const handleAddOrganiser = async (userId: string) => {
    if (!currentEventDetails) return;
    try {
      const validatedData = assignOrganiserSchema.parse({ userId });
      const response = await fetch(
        `/api/events/${currentEventDetails.id}/organisers`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validatedData),
        },
      );
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
      const response = await fetch(
        `/api/events/${currentEventDetails.id}/organisers`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validatedData),
        },
      );
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
      const response = await fetch(
        `/api/events/${currentEventDetails.id}/judges`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validatedData),
        },
      );
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
      const response = await fetch(
        `/api/events/${currentEventDetails.id}/judges`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validatedData),
        },
      );
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

  const handleAddParticipant = async (userId: string) => {
    if (!currentEventDetails) return;
    try {
      const validatedData = assignParticipantSchema.parse({ userId });
      const response = await fetch(
        `/api/events/${currentEventDetails.id}/participants`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validatedData),
        },
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        toast.success("Participant added successfully!");
        fetchEventDetails(currentEventDetails.id); // Re-fetch details
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
    if (!currentEventDetails) return;
    if (!confirm("Are you sure you want to remove this participant?")) return;
    try {
      const validatedData = assignParticipantSchema.parse({ userId });
      const response = await fetch(
        `/api/events/${currentEventDetails.id}/participants`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validatedData),
        },
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        toast.success("Participant removed successfully!");
        fetchEventDetails(currentEventDetails.id); // Re-fetch details
      } else {
        toast.error(`Failed to remove participant: ${data.error.message}`);
      }
    } catch (err: any) {
      toast.error(`Error removing participant: ${err.message}`);
      }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            Manage Event: {currentEventDetails.name}
          </DialogTitle>
          <DialogDescription>
            Manage organisers, judges, and participants for this event.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="organisers">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="organisers">Organisers</TabsTrigger>
            <TabsTrigger value="judges">Judges</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
          </TabsList>
          <TabsContent value="organisers">
            <EventOrganisersManagement
              eventId={currentEventDetails.id}
              currentOrganisers={currentEventDetails.eventsToOrganisers}
              onUpdate={() => fetchEventDetails(currentEventDetails.id)}
              onAddOrganiser={handleAddOrganiser}
              onRemoveOrganiser={handleRemoveOrganiser}
            />
          </TabsContent>
          <TabsContent value="judges">
            <EventJudgesManagement
              eventId={currentEventDetails.id}
              currentJudges={currentEventDetails.judges}
              onUpdate={() => fetchEventDetails(currentEventDetails.id)}
              onAddJudge={handleAddJudge}
              onRemoveJudge={handleRemoveJudge}
            />
          </TabsContent>
          <TabsContent value="participants">
            <EventParticipantsManagement
              eventId={currentEventDetails.id}
              currentParticipants={currentEventDetails.participants}
              onUpdate={() => fetchEventDetails(currentEventDetails.id)}
              onAddParticipant={handleAddParticipant}
              onRemoveParticipant={handleRemoveParticipant}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
