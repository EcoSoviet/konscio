import { defineCollection } from "astro:content";
import { dispatchesSchema } from "../schemas/dispatches";
import { compendiumSchema } from "../schemas/compendium";

const dispatches = defineCollection({
  type: "content",
  schema: dispatchesSchema,
});

const compendium = defineCollection({
  type: "content",
  schema: compendiumSchema,
});

export const collections = { dispatches, compendium };
