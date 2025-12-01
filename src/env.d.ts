/// <reference types="vitest/config" />
/// <reference types="astro/client" />

declare module "astro:content" {
  export { z } from "astro/zod";
  export type CollectionEntry<C extends keyof typeof import("./content/config").collections> =
    import("./content/config").collections[C] extends { type: "content" }
      ? import("astro").ContentEntry<C>
      : import("astro").DataEntry<C>;
}
