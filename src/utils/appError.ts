import { z } from "zod";

export const appErrorSchema = z.discriminatedUnion("code", [
	z.object({
		code: z.literal("RECIPE_SLOT_LIMIT_REACHED"),
		used: z.number(),
		limit: z.number(),
		requested: z.number(),
	}),
]);

export type AppErrorPayload = z.infer<typeof appErrorSchema>;

export class AppError extends Error {
	constructor(public payload: AppErrorPayload) {
		super(payload.code);
		this.name = "AppError";
	}
}

export function getAppErrorMessage(payload: AppErrorPayload): string {
	switch (payload.code) {
		case "RECIPE_SLOT_LIMIT_REACHED": {
			const free = Math.max(0, payload.limit - payload.used);
			return `You can only add ${free} more recipe${free === 1 ? "" : "s"} (${payload.used} / ${payload.limit} used).`;
		}
	}
}
