"use client";

import { getIngredientId } from "@bespoke/domain/ingredients/getIngredientId";
import { searchByIndex } from "@bespoke/domain/utils/search";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalTypeaheadMenuPlugin } from "@lexical/react/LexicalTypeaheadMenuPlugin";
import type { TextNode } from "lexical";
import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { useRecipeIngredients } from "../../hooks/useRecipeIngredients";
import { useHistoricUpdateRef } from "./HistoricUpdateGuard";
import { IngredientOption } from "./IngredientOption";
import { useTypeaheadMenu } from "./useTypeaheadMenu";
import {
	createIngredientMenuOption,
	createIngredientTriggerFn,
	type IngredientMenuOption,
	MAX_TYPEAHEAD_OPTIONS,
} from "./utils";

export function IngredientTypeaheadPlugin() {
	const [editor] = useLexicalComposerContext();
	const [query, setQuery] = useState<string | null>(null);
	const deferredQuery = useDeferredValue(query);
	const { sortedIngredients, searchIndex, knownNames } = useRecipeIngredients();
	const historicRef = useHistoricUpdateRef();

	const triggerFn = useMemo(
		() => createIngredientTriggerFn(knownNames, historicRef),
		[knownNames, historicRef],
	);

	const options = useMemo(() => {
		if (!deferredQuery) return [];
		return searchByIndex(
			sortedIngredients,
			searchIndex,
			getIngredientId,
			deferredQuery,
		)
			.slice(0, MAX_TYPEAHEAD_OPTIONS)
			.map(createIngredientMenuOption);
	}, [sortedIngredients, searchIndex, deferredQuery]);

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

	const menuRenderFn = useTypeaheadMenu({
		options,
		query,
		getLabel: (option) => option.ingredient.name,
		renderOption: ({ option, isHighlighted, onSelect, onHighlight }) => (
			<IngredientOption
				key={option.key}
				ref={option.setRefElement}
				ingredient={option.ingredient}
				isHighlighted={isHighlighted}
				onClick={onSelect}
				onMouseEnter={onHighlight}
			/>
		),
	});

	return (
		<LexicalTypeaheadMenuPlugin<IngredientMenuOption>
			options={options}
			triggerFn={triggerFn}
			onQueryChange={setQuery}
			onSelectOption={onSelectOption}
			menuRenderFn={menuRenderFn}
		/>
	);
}
