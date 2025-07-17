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

interface EditEventDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentEvent: Event | null;
  setCurrentEvent: (event: Event) => void;
  onSaveEdit: () => void;
}

export function EditEventDialog({
  isOpen,
  onOpenChange,
  currentEvent,
  setCurrentEvent,
  onSaveEdit,
}: EditEventDialogProps) {
  if (!currentEvent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogDescription>
            Make changes to the event here. Click save when you&apos;re done.
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
              onChange={(e) =>
                setCurrentEvent({ ...currentEvent, name: e.target.value })
              }
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
              onChange={(e) =>
                setCurrentEvent({
                  ...currentEvent,
                  description: e.target.value,
                })
              }
              className="col-span-3 min-h-[80px]"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startDate" className="text-right">
              Start Date
            </Label>
            <Input
              id="startDate"
              type="datetime-local"
              value={new Date(currentEvent.startDate).toISOString().slice(0, 16)}
              onChange={(e) =>
                setCurrentEvent({
                  ...currentEvent,
                  startDate: e.target.value,
                })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endDate" className="text-right">
              End Date
            </Label>
            <Input
              id="endDate"
              type="datetime-local"
              value={new Date(currentEvent.endDate).toISOString().slice(0, 16)}
              onChange={(e) =>
                setCurrentEvent({
                  ...currentEvent,
                  endDate: e.target.value,
                })
              }
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
              onChange={(e) =>
                setCurrentEvent({
                  ...currentEvent,
                  location: e.target.value,
                })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="poster" className="text-right">
              Poster URL
            </Label>
            <Input
              id="poster"
              value={currentEvent.poster || ""}
              onChange={(e) =>
                setCurrentEvent({ ...currentEvent, poster: e.target.value })
              }
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
                onChange={(e) =>
                  setCurrentEvent({
                    ...currentEvent,
                    isActive: e.target.checked,
                  })
                }
                className="h-4 w-4"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={onSaveEdit}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
