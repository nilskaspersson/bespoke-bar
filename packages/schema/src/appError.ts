import { z } from "zod";

export const appErrorSchema = z.discriminatedUnion("code", [
	z.object({
		code: z.literal("RECIPE_SLOT_LIMIT_REACHED"),
		used: z.number(),
		limit: z.number(),
		requested: z.number(),
	}),
	z.object({
		code: z.literal("RECIPE_LINE_LIMIT_REACHED"),
		limit: z.number(),
		recipeName: z.string().nullish(),
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
		code: z.literal("INGREDIENT_IN_USE"),
		recipeCount: z.number(),
	}),
	z.object({
		code: z.literal("NO_RECIPE_FOUND"),
	}),
	z.object({
		code: z.literal("NO_RECIPES_PROVIDED"),
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
	if (seconds < 86400) {
		const n = Math.round(seconds / 3600);
		return `${n} hour${n === 1 ? "" : "s"}`;
	}
	const n = Math.round(seconds / 86400);
	return `${n} day${n === 1 ? "" : "s"}`;
}

export function getAppErrorToast(payload: AppErrorPayload): AppErrorToast {
	switch (payload.code) {
		case "RECIPE_SLOT_LIMIT_REACHED": {
			const free = Math.max(0, payload.limit - payload.used);
			return {
				message: "Recipe limit reached",
				description: `You can only add ${free} more Recipe${free === 1 ? "" : "s"} (${payload.used} / ${payload.limit} used).`,
			};
		}
		case "RECIPE_LINE_LIMIT_REACHED": {
			const name = payload.recipeName?.trim();
			return {
				message: "Too many Ingredients",
				description: `${name ? `"${name}"` : "A Recipe"} can have at most ${payload.limit} Ingredients.`,
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
		case "INGREDIENT_IN_USE": {
			const n = payload.recipeCount;
			return {
				message: "Ingredient in use",
				description: `This Ingredient is used in ${n} recipe${n === 1 ? "" : "s"}. Remove it from every Ingredient Line before deleting.`,
			};
		}
		case "NO_RECIPE_FOUND": {
			return {
				message: "No recipe found",
				description:
					"We couldn't read a recipe from the provided image. Try another photo.",
			};
		}
		case "NO_RECIPES_PROVIDED": {
			return {
				message: "Nothing to create",
				description: "Add at least one Recipe.",
			};
		}
	}
}

export function getAppErrorMessage(payload: AppErrorPayload): string {
	return getAppErrorToast(payload).description;
}
