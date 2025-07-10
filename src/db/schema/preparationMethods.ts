import { pgEnum } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import type { z } from "zod/v4";

export const preparationMethodEnum = pgEnum("preparation_method", [
	"blended",
	"built",
	"layered",
	"shaken",
	"stirred",
]);

export const preparationMethods = createSelectSchema(preparationMethodEnum);

export type PreparationMethod = z.infer<typeof preparationMethods>;
