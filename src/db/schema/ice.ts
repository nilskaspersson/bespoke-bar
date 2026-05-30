import { pgEnum } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

export const iceEnum = pgEnum("ice", ["none", "cubed", "crushed"]);

export const ice = createSelectSchema(iceEnum);

export type Ice = z.infer<typeof ice>;
