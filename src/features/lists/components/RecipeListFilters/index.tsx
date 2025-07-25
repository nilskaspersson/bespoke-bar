"use client";

import {
	type ComponentProps,
	useDeferredValue,
	useMemo,
	useState,
} from "react";
import { EmptyArea } from "@/app/components/EmptyArea";
import { RecipeEntryList } from "@/features/lists/components/RecipeEntryList";
import { Grid } from "@/ui/Grid";
import { Input } from "@/ui/Input";
import { Text } from "@/ui/Text";
import { normalizeInput } from "@/utils";

export function RecipeListFilters({
	entries,
	...props
}: ComponentProps<typeof RecipeEntryList>) {
	const [search, setSearch] = useState("");
	const deferredSearch = useDeferredValue(search);

	const filteredEntries = useMemo(() => {
		const normalizedSearch = normalizeInput(deferredSearch);

		if (!normalizedSearch) {
			return entries;
		}

		return entries.filter(
			(entry) =>
				normalizeInput(entry.recipe.name ?? "").includes(normalizedSearch) ||
				normalizeInput(
					entry.recipe.specs.map((spec) => spec.ingredient.name).join(" "),
				).includes(normalizedSearch),
		);
	}, [entries, deferredSearch]);

	return (
		<Grid gap={6}>
			<Input
				type="search"
				value={search}
				placeholder="Search in List…"
				fullWidth
				onChange={(e) => setSearch(e.target.value)}
			/>

			{filteredEntries.length === 0 && entries.length > 0 ? (
				<EmptyArea color="light">
					<Text size={4} heavy weight={600}>
						No recipes found
					</Text>
				</EmptyArea>
			) : (
				<RecipeEntryList entries={filteredEntries} {...props} />
			)}
		</Grid>
	);
}
