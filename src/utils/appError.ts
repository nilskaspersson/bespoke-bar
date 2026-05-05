import { z } from "zod";

export const appErrorSchema = z.discriminatedUnion("code", [
	z.object({
		code: z.literal("RECIPE_SLOT_LIMIT_REACHED"),
		used: z.number(),
		limit: z.number(),
		requested: z.number(),
	}),
	z.object({
		code: z.literal("RATE_LIMIT_EXCEEDED"),
		retryAfter: z.number(),
	}),
]);

export type AppErrorPayload = z.infer<typeof appErrorSchema>;

export type AppErrorToast = {
	message: string;
	description: string;
};

/**
 * Schema-driven toast content for an AppError. The pair `{ message, description }`
 * matches the shape `toast.promise`'s success/error callbacks.
 */
export function getAppErrorToast(payload: AppErrorPayload): AppErrorToast {
	switch (payload.code) {
		case "RECIPE_SLOT_LIMIT_REACHED": {
			const free = Math.max(0, payload.limit - payload.used);
			return {
				message: "Recipe limit reached",
				description: `You can only add ${free} more recipe${free === 1 ? "" : "s"} (${payload.used} / ${payload.limit} used).`,
			};
		}
		case "RATE_LIMIT_EXCEEDED": {
			return {
				message: "Slow down",
				description: `Try again in ${payload.retryAfter} second${payload.retryAfter === 1 ? "" : "s"}.`,
			};
		}
	}
}

export function getAppErrorMessage(payload: AppErrorPayload): string {
	return getAppErrorToast(payload).description;
}

export class AppError extends Error {
	constructor(public payload: AppErrorPayload) {
		super(getAppErrorMessage(payload));
		this.name = "AppError";
	}
}
