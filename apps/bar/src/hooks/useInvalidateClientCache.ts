"use client";

import { useCallback } from "react";
import { trpc } from "@/trpc/client";

type CacheEvent =
	| "ingredient.create"
	| "ingredient.update"
	| "ingredient.delete"
	| "recipe.create"
	| "recipe.update"
	| "recipe.delete"
	| "menu.create"
	| "menu.update"
	| "menu.delete"
	| "favorite.toggle";

/**
 * Client-side mirror of the server cache tag system for tRPC.
 */
export function useInvalidateClientCache() {
	const utils = trpc.useUtils();

	return useCallback(
		(...events: CacheEvent[]) => {
			const seen = new Set<string>();

			function invalidate(key: string, fn: () => void) {
				if (!seen.has(key)) {
					seen.add(key);
					fn();
				}
			}

			for (const event of events) {
				switch (event) {
					case "ingredient.create":
					case "ingredient.update":
					case "ingredient.delete":
						invalidate("ingredient", () => utils.ingredient.invalidate());
						invalidate("recipe", () => utils.recipe.invalidate());
						invalidate("menu", () => utils.menu.invalidate());
						break;

					case "recipe.create":
					case "recipe.update":
					case "recipe.delete":
						invalidate("recipe", () => utils.recipe.invalidate());
						invalidate("menu", () => utils.menu.invalidate());
						break;

					case "menu.create":
					case "menu.update":
					case "menu.delete":
						invalidate("menu", () => utils.menu.invalidate());
						break;

					case "favorite.toggle":
						invalidate("favorite", () => utils.favorite.invalidate());
						break;
				}
			}
		},
		[utils],
	);
}
