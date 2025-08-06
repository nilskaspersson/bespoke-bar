"use client";

import { mutate } from "swr";

export function mutateSWRRecipeListsCache() {
	mutate("/api/lists", undefined, {
		revalidate: true,
	});
}

export function mutateSWROrganisationCache() {
	mutate("/api/organisation", undefined, {
		revalidate: true,
	});
}

export function mutateSWRBarRecipesCache() {
	mutate("/api/recipes", undefined, {
		revalidate: true,
	});
}
