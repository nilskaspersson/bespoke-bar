"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalTypeaheadMenuPlugin } from "@lexical/react/LexicalTypeaheadMenuPlugin";
import type { TextNode } from "lexical";
import { useCallback, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { Ingredient } from "@/db/schema/ingredients";
import { CATEGORY_TO_LABEL } from "@/features/ingredients/constants";
import { Kbd } from "@/ui/Kbd";
import { OptionsList } from "@/ui/OptionsList";
import { Text } from "@/ui/Text";
import { normalizeInput } from "@/utils";
import { collator } from "@/utils/collator";
import { createSearchIndex, searchByIndex } from "@/utils/search";
import { GhostTextController } from "./GhostTextController";
import styles from "./styles.module.css";
import {
	createIngredientTriggerFn,
	formatAbv,
	IngredientMenuOption,
	MAX_TYPEAHEAD_OPTIONS,
} from "./utils";

const getIngredientId = (i: Ingredient) => i.id;

export function IngredientTypeaheadPlugin({
	ingredients,
}: {
	ingredients: Ingredient[];
}) {
	const [editor] = useLexicalComposerContext();
	const [query, setQuery] = useState<string | null>(null);

	const sortedIngredients = useMemo(
		() => [...ingredients].sort((a, b) => collator.compare(a.name, b.name)),
		[ingredients],
	);

	const ingredientIndex = useMemo(
		() =>
			createSearchIndex(sortedIngredients, getIngredientId, (i) => {
				const fields = [i.name];
				const categoryLabel = i.category
					? CATEGORY_TO_LABEL.get(i.category)
					: null;
				if (categoryLabel) fields.push(categoryLabel);
				return fields;
			}),
		[sortedIngredients],
	);

	const knownNames = useMemo(
		() => new Set(sortedIngredients.map((i) => normalizeInput(i.name))),
		[sortedIngredients],
	);

	const triggerFn = useMemo(
		() => createIngredientTriggerFn(knownNames),
		[knownNames],
	);

	const options = useMemo(() => {
		if (!query) return [];
		return searchByIndex(
			sortedIngredients,
			ingredientIndex,
			getIngredientId,
			query,
		)
			.slice(0, MAX_TYPEAHEAD_OPTIONS)
			.map((i) => new IngredientMenuOption(i));
	}, [sortedIngredients, ingredientIndex, query]);

	const onSelectOption = useCallback(
		(
			selectedOption: IngredientMenuOption,
			textNodeContainingQuery: TextNode | null,
			closeMenu: () => void,
		) => {
			editor.update(() => {
				if (textNodeContainingQuery) {
					textNodeContainingQuery.setTextContent(
						selectedOption.ingredient.name,
					);
					textNodeContainingQuery.selectEnd();
				}
				closeMenu();
			});
		},
		[editor],
	);

	return (
		<LexicalTypeaheadMenuPlugin<IngredientMenuOption>
			options={options}
			triggerFn={triggerFn}
			onQueryChange={setQuery}
			onSelectOption={onSelectOption}
			menuRenderFn={(
				anchorElementRef,
				{ selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
			) => {
				if (!anchorElementRef.current || options.length === 0) return null;
				return createPortal(
					<>
						<GhostTextController
							query={query}
							options={options}
							selectedIndex={selectedIndex}
						/>
						<OptionsList
							className={styles.typeahead}
							onMouseDown={(e) => e.preventDefault()}
							footer={
								<Text size={1} className={styles.footer}>
									<Kbd shortcut="tab" visual variant="ghost" /> or{" "}
									<Kbd shortcut="enter" visual variant="ghost" /> to complete
								</Text>
							}
						>
							{options.map((option, index) => {
								const { ingredient } = option;
								const category = ingredient.category
									? CATEGORY_TO_LABEL.get(ingredient.category)
									: null;
								const abv = formatAbv(ingredient.abv);

								return (
									<OptionsList.Item
										key={option.key}
										ref={option.setRefElement}
										isHighlighted={selectedIndex === index}
										onClick={() => {
											setHighlightedIndex(index);
											selectOptionAndCleanUp(option);
										}}
										onMouseEnter={() => setHighlightedIndex(index)}
									>
										<OptionsList.Label
											description={
												[category, abv].filter(Boolean).join(", ") || undefined
											}
										>
											{ingredient.name}
										</OptionsList.Label>
									</OptionsList.Item>
								);
							})}
						</OptionsList>
					</>,
					anchorElementRef.current,
				);
			}}
		/>
	);
}
