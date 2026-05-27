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
	z.object({
		code: z.literal("OCR_QUOTA_REACHED"),
		limit: z.number(),
		used: z.number(),
		retryAfter: z.number(),
	}),
	z.object({
		code: z.literal("NO_RECIPE_FOUND"),
	}),
]);

export type AppErrorPayload = z.infer<typeof appErrorSchema>;

export type AppErrorToast = {
	message: string;
	description: string;
};

export function formatRetryAfter(seconds: number): string {
	if (seconds < 60) {
		const n = Math.max(1, Math.round(seconds));
		return `${n} second${n === 1 ? "" : "s"}`;
	}
	if (seconds < 3600) {
		const n = Math.round(seconds / 60);
		return `${n} minute${n === 1 ? "" : "s"}`;
	}
	const n = Math.round(seconds / 3600);
	return `${n} hour${n === 1 ? "" : "s"}`;
}

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
		case "OCR_QUOTA_REACHED": {
			return {
				message: "Photo-to-Recipe quota reached",
				description: `You've used all ${payload.limit} of your Photo-to-Recipe uses. The next one unlocks in ${formatRetryAfter(payload.retryAfter)}.`,
			};
		}
		case "NO_RECIPE_FOUND": {
			return {
				message: "No recipe found",
				description:
					"We couldn't read a recipe from that image. It still counts as a use, so try a clearer photo.",
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
