"use client";

import { useDeferredValue, useMemo, useRef, useState } from "react";

import type { RecipeWithRelations } from "@/db/schema/recipes";
import type { Tag } from "@/db/schema/tags";
import { RecipesList } from "@/features/recipes/components/RecipesList";
import {
	createRecipeSearchIndex,
	filterRecipes,
} from "@/features/recipes/utils/filterRecipes";
import { RecipeTag } from "@/features/tags/components/RecipeTag";
import { RecipeTagsCombobox } from "@/features/tags/components/RecipeTagsCombobox";
import { usePopover } from "@/hooks/usePopover";
import { Button } from "@/ui/Button";
import { Flex } from "@/ui/Flex";
import { Icon } from "@/ui/Icon";
import { Input } from "@/ui/Input";
import { Kbd } from "@/ui/Kbd";
import { Text } from "@/ui/Text";

const TOP_TAG_COUNT = 5;

type Props = {
	recipes: RecipeWithRelations[];
	favoriteRecipeIds?: string[];
	tagOptions?: Tag[];
	/**
	 * When true, a recipe must carry every selected tag. When false (default),
	 * a recipe matches if it carries any of them — multi-select widens the
	 * result, which is what most users expect from a tag filter.
	 */
	requireAll?: boolean;
};

export function RecipesListFilters({
	recipes,
	favoriteRecipeIds,
	tagOptions,
	requireAll = false,
}: Props) {
	const tagsPopover = usePopover({ type: "auto" });

	const [search, setSearch] = useState("");
	const deferredSearch = useDeferredValue(search);
	const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
	const searchRef = useRef<HTMLInputElement>(null);

	const searchIndex = useMemo(
		() => createRecipeSearchIndex(recipes),
		[recipes],
	);

	const filteredRecipes = useMemo(() => {
		const bySearch = filterRecipes(recipes, searchIndex, deferredSearch);
		if (selectedTagIds.length === 0) return bySearch;
		return bySearch.filter((recipe) => {
			const recipeTagIds = new Set(recipe.tags.map((rt) => rt.tag.id));
			return requireAll
				? selectedTagIds.every((id) => recipeTagIds.has(id))
				: selectedTagIds.some((id) => recipeTagIds.has(id));
		});
	}, [recipes, searchIndex, deferredSearch, selectedTagIds, requireAll]);

	/**
	 * Top-N most-used tags across the current `recipes`, surfaced as quick
	 * toggles. Tags with zero usage are dropped — clicking them would always
	 * yield an empty result. The full picker is reachable via the inline
	 * "All tags" button.
	 */
	const topTags = useMemo(() => {
		if (!tagOptions || tagOptions.length === 0) return [];
		const counts = new Map<string, number>();
		for (const recipe of recipes) {
			for (const rt of recipe.tags) {
				counts.set(rt.tag.id, (counts.get(rt.tag.id) ?? 0) + 1);
			}
		}
		return tagOptions
			.filter((tag) => (counts.get(tag.id) ?? 0) > 0)
			.sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0))
			.slice(0, TOP_TAG_COUNT);
	}, [recipes, tagOptions]);

	const toggleTag = (tagId: string) => {
		setSelectedTagIds((prev) =>
			prev.includes(tagId)
				? prev.filter((id) => id !== tagId)
				: [...prev, tagId],
		);
	};

	const handleReset = () => {
		setSearch("");
		setSelectedTagIds([]);
	};

	const hasFilters = search.length > 0 || selectedTagIds.length > 0;
	const hasTagOptions = topTags.length > 0;

	return (
		<Flex direction="column" gap={3} alignItems="stretch">
			<Input
				type="search"
				ref={searchRef}
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				placeholder="Filter recipes, ingredients…"
				startAdornment={<Icon name="magnifying-glass" size={4} />}
				endAdornment={
					<Kbd shortcut="mod+f" onTrigger={() => searchRef.current?.focus()} />
				}
				rounded
			/>

			{hasTagOptions ? (
				<Flex gap={1} alignItems="center" wrap>
					{topTags.map((tag) => (
						<RecipeTag
							key={tag.id}
							tag={tag}
							selected={selectedTagIds.includes(tag.id)}
							onClick={() => toggleTag(tag.id)}
						/>
					))}

					<Button {...tagsPopover.triggerProps} variant="action" size="tiny">
						<Icon name="tags" size={1} />
						All tags
					</Button>

					<RecipeTagsCombobox
						popoverContentProps={tagsPopover.contentProps}
						onClosePopover={tagsPopover.closePopover}
						tagOptions={tagOptions ?? []}
						assignedTagIds={selectedTagIds}
						onCommit={setSelectedTagIds}
					/>
				</Flex>
			) : null}

			{hasFilters ? (
				<Flex justifyContent="flex-end">
					<Button variant="ghost" size="tiny" onClick={handleReset}>
						Reset filters
					</Button>
				</Flex>
			) : null}

			<RecipesList
				recipes={filteredRecipes}
				favoriteRecipeIds={favoriteRecipeIds}
				tagOptions={tagOptions}
				withActions
			/>
		</Flex>
	);
}
