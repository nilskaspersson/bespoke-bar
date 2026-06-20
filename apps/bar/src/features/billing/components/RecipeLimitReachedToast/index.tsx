"use client";

import type { RecipeSlotUsage } from "@/features/billing/api/getRecipeSlotUsage";
import { LinkButton } from "@/ui/Button";
import { Flex } from "@/ui/Flex";
import { toast } from "@/ui/Toast";

function RecipeLimitReachedDescription({ usage }: { usage: RecipeSlotUsage }) {
	return (
		<Flex direction="column" gap={2} alignItems="flex-start">
			<span>
				{usage.used} / {usage.limit} used.
			</span>

			<LinkButton href="/bar/settings#billing" size="tiny" variant="outline">
				Get more slots
			</LinkButton>
		</Flex>
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
