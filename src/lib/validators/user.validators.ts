import { z } from "zod";

export const updateUserProfileSchema = z.object({
  name: z.string().min(1, "Name is required.").optional(),
  email: z.string().email("Invalid email address.").optional(),
});
