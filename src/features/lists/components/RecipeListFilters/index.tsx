"use client";

import {
	type ComponentProps,
	useDeferredValue,
	useMemo,
	useState,
} from "react";
import { EmptyArea } from "@/app/components/EmptyArea";
import type { RecipeListWithRecipes } from "@/db/schema/recipeLists";
import { RecipeEntryList } from "@/features/lists/components/RecipeEntryList";
import { Button, LinkButton } from "@/ui/Button";
import { Flex } from "@/ui/Flex";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Input } from "@/ui/Input";
import { normalizeInput } from "@/utils";

export function RecipeListFilters({
	list,
	editable,
	...props
}: ComponentProps<typeof Grid> & {
	list: RecipeListWithRecipes;
	editable?: boolean;
}) {
	const [search, setSearch] = useState("");
	const deferredSearch = useDeferredValue(search);

	const { entries } = list;

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
					<Heading level="h3" size={4}>
						No recipes found
					</Heading>

					<Flex as="menu" gap={2} wrap justifyContent="center">
						<li>
							<LinkButton
								href={`/bar/lists/${list.id}/edit`}
								variant="outline"
								color="light"
								size="small"
							>
								Add recipes
							</LinkButton>
						</li>

						<li>
							<Button
								variant="outline"
								color="light"
								size="small"
								onClick={() => setSearch("")}
							>
								Clear search
							</Button>
						</li>
					</Flex>
				</EmptyArea>
			) : (
				<RecipeEntryList
					entries={filteredEntries}
					editable={editable}
					{...props}
				/>
			)}
		</Grid>
	);
}
