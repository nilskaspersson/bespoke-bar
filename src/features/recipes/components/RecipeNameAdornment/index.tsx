"use client";

import { useEffect, useRef } from "react";
import { ServingsBadge } from "@/features/recipes/components/ServingsBadge";
import { Icon } from "@/ui/Icon";
import { animate, keyframes } from "@/utils/animate";

export function RecipeNameAdornment({ servings }: { servings?: number }) {
	const badgeRef = useRef<HTMLSpanElement>(null);
	const prevServings = useRef(servings);

	useEffect(() => {
		const prev = prevServings.current;
		const wasUpscaled = prev != null && prev > 1;

		if (wasUpscaled && prev !== servings) {
			animate(badgeRef.current, keyframes.get("pulse"));
		}

		prevServings.current = servings;
	}, [servings]);

	return (
		<>
			{servings != null && servings > 1 ? (
				<ServingsBadge servings={servings} ref={badgeRef} />
			) : null}

			<Icon name="duotone-martini-glass" size={3} />
		</>
	);
}
