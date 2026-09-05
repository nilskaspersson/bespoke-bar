"use client";

import type { IngredientIndex } from "@bespoke/domain/ingredients/buildIngredientIndex";
import { type Token, tokenizeLine } from "@bespoke/domain/recipes/tokenizeLine";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	$getRoot,
	$isParagraphNode,
	HISTORIC_TAG,
	type NodeKey,
	type ParagraphNode,
} from "lexical";
import { useEffect } from "react";
import { useRecipeIngredients } from "@/features/recipes/bulk/components/RecipeEditor/hooks/useRecipeIngredients";
import { createParagraphDOMRange } from "@/features/recipes/bulk/components/RecipeEditor/utils/paragraphRange";

const HIGHLIGHT_NAMES = [
	"recipe-quantity",
	"recipe-unit",
	"recipe-ingredient",
	"recipe-known",
	"recipe-invalid",
] as const;

type HighlightGroup = (typeof HIGHLIGHT_NAMES)[number];

/**
 * Inlined into a runtime `<style>` tag rather than a CSS module: lightningcss
 * (≤ 1.32.0 — the version shipped with Next 16.2.3) rejects the
 * `::highlight(name)` pseudo-element at build time with a fatal parse error.
 * The fix has landed upstream (parcel-bundler/lightningcss#970, merged
 * 2026-03-12) but hasn't been released to npm yet. Injecting at runtime
 * bypasses the build-time parse entirely; revisit when lightningcss 1.33+
 * ships and the `.module.css` approach starts working.
 */
const HIGHLIGHT_CSS = `
::highlight(recipe-quantity) { color: var(--iris-11); }
::highlight(recipe-unit) { color: var(--grass-11); }
::highlight(recipe-ingredient) { color: var(--mauve-11); }
::highlight(recipe-known) {
	color: var(--mauve-12);
	text-decoration: underline;
	text-decoration-color: var(--mauve-8);
	text-underline-offset: 3px;
}
::highlight(recipe-invalid) {
	text-decoration: wavy underline;
	text-decoration-color: var(--red-9);
	text-underline-offset: 3px;
}
`;

type TokenSpan = {
	group: HighlightGroup;
	start: number;
	end: number;
};

type ParagraphCacheEntry = {
	text: string;
	spans: TokenSpan[];
};

function getHighlightGroup(token: Token): HighlightGroup | null {
	switch (token.type) {
		case "quantity":
			return "recipe-quantity";
		case "unit":
			return token.valid ? "recipe-unit" : "recipe-invalid";
		case "ingredient":
			return token.ingredientId ? "recipe-known" : "recipe-ingredient";
		default:
			return null;
	}
}

function tokenizeParagraph(
	paragraph: ParagraphNode,
	ingredientIndex: IngredientIndex,
): ParagraphCacheEntry {
	const text = paragraph.getTextContent();
	const spans: TokenSpan[] = [];
	if (text.trim()) {
		const { tokens } = tokenizeLine(text, ingredientIndex);
		for (const token of tokens) {
			const group = getHighlightGroup(token);
			if (!group) continue;
			spans.push({ group, start: token.start, end: token.end });
		}
	}
	return { text, spans };
}

export function SyntaxHighlightPlugin() {
	const [editor] = useLexicalComposerContext();
	const { ingredientIndex } = useRecipeIngredients();

	useEffect(() => {
		const style = document.createElement("style");
		style.setAttribute("data-recipe-highlights", "");
		style.textContent = HIGHLIGHT_CSS;
		document.head.appendChild(style);
		return () => style.remove();
	}, []);

	useEffect(() => {
		if (!CSS.highlights) return;

		/**
		 * Per-paragraph token cache keyed by NodeKey. Avoids re-tokenizing
		 * paragraphs whose text hasn't changed — for a 50-line recipe where
		 * only one line was edited, we skip 49 parser passes on every
		 * keystroke. DOM Ranges must always be rebuilt (offsets don't
		 * auto-track text mutations), but range construction is much
		 * cheaper than tokenization.
		 */
		const cache = new Map<NodeKey, ParagraphCacheEntry>();

		const updateHighlights = () => {
			editor.read(() => {
				const root = $getRoot();
				const ranges = new Map<HighlightGroup, Range[]>();
				for (const name of HIGHLIGHT_NAMES) ranges.set(name, []);
				const liveKeys = new Set<NodeKey>();

				for (const child of root.getChildren()) {
					if (!$isParagraphNode(child)) continue;
					const key = child.getKey();
					liveKeys.add(key);

					const currentText = child.getTextContent();
					let entry = cache.get(key);
					if (!entry || entry.text !== currentText) {
						entry = tokenizeParagraph(child, ingredientIndex);
						cache.set(key, entry);
					}
					if (entry.spans.length === 0) continue;

					for (const span of entry.spans) {
						const range = createParagraphDOMRange(
							editor,
							child,
							span.start,
							span.end,
						);
						if (range) ranges.get(span.group)?.push(range);
					}
				}

				for (const key of cache.keys()) {
					if (!liveKeys.has(key)) cache.delete(key);
				}

				for (const name of HIGHLIGHT_NAMES) {
					const group = ranges.get(name);
					if (group && group.length > 0) {
						CSS.highlights.set(name, new Highlight(...group));
					} else {
						CSS.highlights.delete(name);
					}
				}
			});
		};

		updateHighlights();

		/**
		 * Fire on text mutation only. `dirtyLeaves` holds the TextNode keys
		 * that changed — selection-only updates leave it empty, so we skip
		 * those without having to diff the full root text. Unchanged
		 * paragraphs short-circuit inside updateHighlights via the
		 * per-paragraph cache.
		 *
		 * Undo / redo are a special case: `HistoryPlugin` rolls state back via
		 * `setEditorState`, which replaces the tree wholesale and reports no
		 * dirty leaves. We detect that via the `HISTORIC_TAG` and force a
		 * full rebuild — after a state swap, node keys may differ from the
		 * cached ones, so we also drop the cache to avoid stale hits.
		 */
		const unregister = editor.registerUpdateListener(
			({ dirtyLeaves, tags }) => {
				if (tags.has(HISTORIC_TAG)) {
					cache.clear();
					updateHighlights();
					return;
				}
				if (dirtyLeaves.size === 0) return;
				updateHighlights();
			},
		);

		return () => {
			unregister();
			for (const name of HIGHLIGHT_NAMES) {
				CSS.highlights?.delete(name);
			}
		};
	}, [editor, ingredientIndex]);

	return null;
}
