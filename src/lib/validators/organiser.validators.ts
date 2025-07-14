import { z } from 'zod';

export const createOrganiserSchema = z.object({
  name: z.string().min(1, "Organiser name is required."),
  profilePicUrl: z.string().url("Invalid URL format.").optional().or(z.literal("")),
});

export const updateOrganiserSchema = createOrganiserSchema.partial();

export const setOrganiserStatusSchema = z.object({
  userId: z.string().min(1, "User ID is required."),
  isOrganiser: z.boolean(),
});