"use client";

import { useEffect, useRef } from "react";
import { ServingsBadge } from "@/features/recipes/components/ServingsBadge";
import { Icon } from "@/ui/Icon";
import { animate, keyframes } from "@/utils/animate";

type Props = {
	servings?: number;
};

/**
 * Skips the pulse for cards the browser isn't rendering.
 */
function isOnScreen(el: Element): boolean {
	if (typeof el.checkVisibility !== "function") return true;
	return el.checkVisibility({ contentVisibilityAuto: true });
}

export function RecipeNameAdornment({ servings }: Props) {
	const badgeRef = useRef<HTMLSpanElement>(null);
	const prevServings = useRef(servings);

	useEffect(() => {
		const prev = prevServings.current;
		const wasUpscaled = prev != null && prev > 1;
		const el = badgeRef.current;

		if (wasUpscaled && prev !== servings && el && isOnScreen(el)) {
			animate(el, keyframes.get("pulse"));
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
