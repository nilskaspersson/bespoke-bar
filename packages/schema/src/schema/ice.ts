import { z } from "zod";

export const ICE_TYPES = ["none", "cubed", "crushed"] as const;

export const ice = z.enum(ICE_TYPES);

export type Ice = z.infer<typeof ice>;
