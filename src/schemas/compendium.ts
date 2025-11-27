import { z } from "astro:content";

export const compendiumSchema = z.object({
  title: z.string(),
  description: z.string(),
  draft: z.boolean().default(false),
});
