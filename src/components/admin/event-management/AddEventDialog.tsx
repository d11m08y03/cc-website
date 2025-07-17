"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Event } from "@/lib/types/event.types";

interface AddEventDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newEvent: Omit<Event, "id">;
  setNewEvent: (event: Omit<Event, "id">) => void;
  onAddEvent: () => void;
}

export function AddEventDialog({
  isOpen,
  onOpenChange,
  newEvent,
  setNewEvent,
  onAddEvent,
}: AddEventDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
          <DialogDescription>Enter details for the new event.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="add-name" className="text-right">
              Name
            </Label>
            <Input
              id="add-name"
              value={newEvent.name}
              onChange={(e) =>
                setNewEvent({ ...newEvent, name: e.target.value })
              }
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
              onChange={(e) =>
                setNewEvent({ ...newEvent, description: e.target.value })
              }
              className="col-span-3 min-h-[80px]"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="add-startDate" className="text-right">
              Start Date
            </Label>
            <Input
              id="add-startDate"
              type="datetime-local"
              value={newEvent.startDate}
              onChange={(e) =>
                setNewEvent({ ...newEvent, startDate: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="add-endDate" className="text-right">
              End Date
            </Label>
            <Input
              id="add-endDate"
              type="datetime-local"
              value={newEvent.endDate}
              onChange={(e) =>
                setNewEvent({ ...newEvent, endDate: e.target.value })
              }
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
              onChange={(e) =>
                setNewEvent({ ...newEvent, location: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="add-poster" className="text-right">
              Poster URL
            </Label>
            <Input
              id="add-poster"
              value={newEvent.poster || ""}
              onChange={(e) =>
                setNewEvent({ ...newEvent, poster: e.target.value })
              }
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
              onChange={(e) =>
                setNewEvent({ ...newEvent, isActive: e.target.checked })
              }
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={onAddEvent}>
            Add Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
