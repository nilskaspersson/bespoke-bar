"use client";

import type { RecipeSlotUsage } from "@/features/billing/api/getRecipeSlotUsage";
import { toast } from "@/ui/Toast";

function RecipeLimitReachedDescription({ usage }: { usage: RecipeSlotUsage }) {
	return (
		<>
			{usage.used} / {usage.limit} used.
		</>
	);
}

export function showRecipeLimitReachedToast(
	usage: RecipeSlotUsage,
	options?: { id?: string },
) {
	return toast.info("Recipe limit reached", {
		id: options?.id,
		description: <RecipeLimitReachedDescription usage={usage} />,
	});
}
