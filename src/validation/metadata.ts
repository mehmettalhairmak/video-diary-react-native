import { z } from "zod";

export const metadataSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export type Metadata = z.infer<typeof metadataSchema>;
