"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalTypeaheadMenuPlugin } from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { $getSelection, $isRangeSelection, type TextNode } from "lexical";
import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { quantityTextParser } from "@/features/quantity/utils/parseQuantity";
import {
	getUnitLabel,
	SORTED_UNITS,
	UNIT_SEARCH_INDEX,
} from "@/features/units/constants";
import { getFormattedUnit } from "@/features/units/utils/getFormattedUnit";
import { unitTextParser } from "@/features/units/utils/parseUnit";
import { searchByIndex } from "@/utils/search";
import { GhostTextController } from "./GhostTextController";
import { TokenMenu } from "./TokenMenu";
import { UnitOption } from "./UnitOption";
import {
	createUnitMenuOption,
	MAX_TYPEAHEAD_OPTIONS,
	type UnitMenuOption,
} from "./utils";

/**
 * Trigger the unit typeahead when the cursor is positioned where a unit
 * would go — after a valid quantity and before a complete unit has been
 * typed. If `unitTextParser` already resolves a valid unit, the user has
 * moved past unit entry (they're now typing an ingredient), so the
 * ingredient typeahead should take over instead.
 *
 * Requires at least one character of partial unit text to fire:
 *   - `quantityTextParser` trims its input, so "3" and "3 " are
 *     indistinguishable from its return value — we can't reliably detect
 *     a trailing space to open an empty-query menu.
 *   - `LexicalTypeaheadMenuPlugin`'s internal `splitNodeContainingQuery`
 *     returns `undefined` when `matchingString` is empty: it calls
 *     `splitText(offset, offset)`, which collapses to a no-op and yields
 *     a single-element array the plugin destructures as `[, newNode]`,
 *     leaving `newNode = undefined`. The select handler then has nothing
 *     to replace and Tab becomes a no-op.
 */
function unitTriggerFn(text: string) {
	const selection = $getSelection();
	if (!$isRangeSelection(selection) || !selection.isCollapsed()) return null;
	const anchor = selection.anchor;
	if (anchor.type !== "text") return null;
	if (anchor.offset !== anchor.getNode().getTextContentSize()) return null;

	const [quantity, quantityRemainder] = quantityTextParser(text);
	if (quantity === null) return null;

	const afterQuantity = quantityRemainder.trimStart();
	if (afterQuantity.length === 0) return null;

	const [unit] = unitTextParser(afterQuantity);
	if (unit !== null) return null;

	return {
		leadOffset: text.length - afterQuantity.length,
		matchingString: afterQuantity,
		replaceableString: afterQuantity,
	};
}

const getOptionLabel = (option: UnitMenuOption) => getUnitLabel(option.unit);

export function UnitTypeaheadPlugin() {
	const [editor] = useLexicalComposerContext();
	const [query, setQuery] = useState<string | null>(null);
	const deferredQuery = useDeferredValue(query);

	const options = useMemo(() => {
		if (!deferredQuery) return [];
		return searchByIndex(
			SORTED_UNITS,
			UNIT_SEARCH_INDEX,
			(u) => u,
			deferredQuery,
		)
			.slice(0, MAX_TYPEAHEAD_OPTIONS)
			.map(createUnitMenuOption);
	}, [deferredQuery]);

	const onSelectOption = useCallback(
		(
			selectedOption: UnitMenuOption,
			textNodeContainingQuery: TextNode | null,
			closeMenu: () => void,
		) => {
			editor.update(() => {
				if (textNodeContainingQuery) {
					/**
					 * Pull the paragraph's text before we mutate, so we can
					 * pluralize the unit label based on the typed quantity
					 * (e.g. "2 dashes" vs "1 dash"). `cl`, `ml`, `fl oz`, etc.
					 * ignore quantity inside `getFormattedUnit` — only the
					 * bartending units actually differ.
					 *
					 * Append a trailing space so the caret lands ready for the
					 * ingredient name, without the user needing to type one.
					 */
					const paragraphText =
						textNodeContainingQuery.getParent()?.getTextContent() ?? "";
					const [quantity] = quantityTextParser(paragraphText);
					const label = getFormattedUnit(selectedOption.unit, quantity ?? 1);
					textNodeContainingQuery.setTextContent(`${label} `);
					textNodeContainingQuery.selectEnd();
				}
				closeMenu();
			});
		},
		[editor],
	);

	return (
		<LexicalTypeaheadMenuPlugin<UnitMenuOption>
			options={options}
			triggerFn={unitTriggerFn}
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
							getLabel={getOptionLabel}
						/>
						<TokenMenu footerAction="complete">
							{options.map((option, index) => (
								<UnitOption
									key={option.key}
									ref={option.setRefElement}
									unit={option.unit}
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
