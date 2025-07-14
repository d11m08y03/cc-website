import { z } from "zod";

export const createEventSchema = z.object({
  name: z.string().min(1, "Event name is required."),
  description: z.string().min(1, "Event description is required."),
  eventDate: z
    .string()
    .datetime("Event date must be a valid date-time string.")
    .transform((str) => new Date(str)),
  location: z.string().min(1, "Event location is required."),
});

export const updateEventSchema = createEventSchema.partial();

export const assignOrganiserSchema = z.object({
  userId: z.string().min(1, "User ID is required."), // Changed from organiserId to userId
});

export const assignJudgeSchema = z.object({
  userId: z.string().min(1, "User ID is required."),
});

export const createTeamSchema = z.object({
  name: z.string().min(1, "Team name is required."),
});