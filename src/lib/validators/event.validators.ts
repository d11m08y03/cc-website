import { z } from "zod";

export const createEventSchema = z.object({
  name: z.string().min(1, "Event name is required."),
  description: z.string().min(1, "Event description is required."),
  startDate: z
    .string()
    .datetime("Start date must be a valid date-time string.")
    .transform((str) => new Date(str)),
  endDate: z
    .string()
    .datetime("End date must be a valid date-time string.")
    .transform((str) => new Date(str)),
  location: z.string().min(1, "Event location is required."),
  poster: z.string().url("Invalid URL format.").optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export const updateEventSchema = createEventSchema.partial();

export const assignOrganiserSchema = z.object({
  userId: z.string().min(1, "User ID is required."),
});

export const assignJudgeSchema = z.object({
  userId: z.string().min(1, "User ID is required."),
});

export const assignParticipantSchema = z.object({
  userId: z.string().min(1, "User ID is required."),
});

export const createTeamSchema = z.object({
  name: z.string().min(1, "Team name is required."),
});

export const createSponsorSchema = z.object({
  name: z.string().min(1, "Sponsor name is required."),
  description: z.string().optional(),
  logo: z.string().url("Invalid URL format.").optional().or(z.literal("")),
});

export const updateSponsorSchema = createSponsorSchema.partial();

export const assignSponsorSchema = z.object({
  sponsorId: z.string().min(1, "Sponsor ID is required."),
});
