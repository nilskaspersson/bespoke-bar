"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalTypeaheadMenuPlugin } from "@lexical/react/LexicalTypeaheadMenuPlugin";
import type { TextNode } from "lexical";
import { useCallback, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { getIngredientId } from "@/features/ingredients/utils";
import { searchByIndex } from "@/utils/search";
import { useRecipeIngredients } from "../../hooks/useRecipeIngredients";
import { GhostTextController } from "./GhostTextController";
import { IngredientOption } from "./IngredientOption";
import { TokenMenu } from "./TokenMenu";
import {
	createIngredientTriggerFn,
	IngredientMenuOption,
	MAX_TYPEAHEAD_OPTIONS,
} from "./utils";

export function IngredientTypeaheadPlugin() {
	const [editor] = useLexicalComposerContext();
	const [query, setQuery] = useState<string | null>(null);
	const { sortedIngredients, searchIndex, knownNames } = useRecipeIngredients();

	const triggerFn = useMemo(
		() => createIngredientTriggerFn(knownNames),
		[knownNames],
	);

	const options = useMemo(() => {
		if (!query) return [];
		return searchByIndex(sortedIngredients, searchIndex, getIngredientId, query)
			.slice(0, MAX_TYPEAHEAD_OPTIONS)
			.map((i) => new IngredientMenuOption(i));
	}, [sortedIngredients, searchIndex, query]);

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
							getLabel={(option) => option.ingredient.name}
						/>
						<TokenMenu footerAction="complete">
							{options.map((option, index) => (
								<IngredientOption
									key={option.key}
									ref={option.setRefElement}
									ingredient={option.ingredient}
									isHighlighted={selectedIndex === index}
									onClick={() => {
										setHighlightedIndex(index);
										selectOptionAndCleanUp(option);
									}}
									onMouseEnter={() => setHighlightedIndex(index)}
								/>
							))}
						</TokenMenu>
					</>,
					anchorElementRef.current,
				);
			}}
		/>
	);
}
