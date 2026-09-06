import { z } from "zod";

export const PREPARATION_METHODS = [
	"blended",
	"built",
	"layered",
	"shaken",
	"stirred",
] as const;

export const preparationMethods = z.enum(PREPARATION_METHODS);

export type PreparationMethod = z.infer<typeof preparationMethods>;
