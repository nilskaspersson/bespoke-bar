import {
	$createLineBreakNode,
	$createParagraphNode,
	$createTextNode,
	$getRoot,
	$getSelection,
	$isElementNode,
	$isLineBreakNode,
	$isParagraphNode,
	$isRangeSelection,
	$isTextNode,
	createEditor,
	type ElementNode,
	type LexicalEditor,
	LineBreakNode,
} from "lexical";
import { describe, expect, test } from "vitest";

/**
 * Mirror of the LineBreakNode normalization transform in ParagraphBreakPlugin.
 * Kept inline here so the test exercises the exact same shape the plugin
 * registers on the real editor.
 */
function registerLineBreakNormalization(editor: LexicalEditor) {
	return editor.registerNodeTransform(LineBreakNode, (node) => {
		const parent = node.getParent();
		if (!$isParagraphNode(parent)) return;

		const newParagraph = $createParagraphNode();
		for (const sibling of node.getNextSiblings()) {
			newParagraph.append(sibling);
		}
		parent.insertAfter(newParagraph);
		node.remove();
		newParagraph.selectStart();
	});
}

function createTestEditor(): LexicalEditor {
	return createEditor({ namespace: "test", onError: console.error });
}

function seedParagraphWithLineBreaks(
	editor: LexicalEditor,
	segments: string[],
): Promise<void> {
	return new Promise((resolve) => {
		editor.update(
			() => {
				const root = $getRoot();
				root.clear();
				const p = $createParagraphNode();
				segments.forEach((segment, i) => {
					if (i > 0) p.append($createLineBreakNode());
					if (segment) p.append($createTextNode(segment));
				});
				root.append(p);
			},
			{ onUpdate: resolve },
		);
	});
}

function readParagraphs(editor: LexicalEditor): string[] {
	return editor.getEditorState().read(() =>
		$getRoot()
			.getChildren()
			.map((child) => child.getTextContent()),
	);
}

function countLineBreakNodes(editor: LexicalEditor): number {
	return editor.getEditorState().read(() => {
		let count = 0;
		const visit = (node: ElementNode) => {
			for (const child of node.getChildren()) {
				if ($isLineBreakNode(child)) count++;
				if ($isElementNode(child)) visit(child);
			}
		};
		visit($getRoot());
		return count;
	});
}

describe("ParagraphBreakPlugin LineBreakNode normalization", () => {
	test("splits a paragraph at a single LineBreakNode", async () => {
		const editor = createTestEditor();
		registerLineBreakNormalization(editor);
		await seedParagraphWithLineBreaks(editor, ["foo", "bar"]);

		const paragraphs = readParagraphs(editor);
		expect(paragraphs).toEqual(["foo", "bar"]);
		expect(countLineBreakNodes(editor)).toBe(0);
	});

	test("splits a paragraph at multiple LineBreakNodes (paste shape)", async () => {
		const editor = createTestEditor();
		registerLineBreakNormalization(editor);
		await seedParagraphWithLineBreaks(editor, [
			"Negroni",
			"3 cl gin",
			"3 cl campari",
			"3 cl sweet vermouth",
		]);

		const paragraphs = readParagraphs(editor);
		expect(paragraphs).toEqual([
			"Negroni",
			"3 cl gin",
			"3 cl campari",
			"3 cl sweet vermouth",
		]);
		expect(countLineBreakNodes(editor)).toBe(0);
	});

	test("leading LineBreakNode produces an empty leading paragraph", async () => {
		const editor = createTestEditor();
		registerLineBreakNormalization(editor);
		await seedParagraphWithLineBreaks(editor, ["", "foo"]);

		const paragraphs = readParagraphs(editor);
		expect(paragraphs).toEqual(["", "foo"]);
		expect(countLineBreakNodes(editor)).toBe(0);
	});

	test("consecutive LineBreakNodes produce empty paragraphs between content", async () => {
		const editor = createTestEditor();
		registerLineBreakNormalization(editor);
		await seedParagraphWithLineBreaks(editor, ["foo", "", "bar"]);

		const paragraphs = readParagraphs(editor);
		expect(paragraphs).toEqual(["foo", "", "bar"]);
		expect(countLineBreakNodes(editor)).toBe(0);
	});

	test("cursor lands at start of the new paragraph (Enter at end-of-line)", async () => {
		const editor = createTestEditor();
		registerLineBreakNormalization(editor);

		/**
		 * Seed a single paragraph, place the caret at the end of its text,
		 * then insert a LineBreakNode — exactly what PlainTextPlugin's Enter
		 * handler does via `selection.insertLineBreak()`.
		 */
		await new Promise<void>((resolve) => {
			editor.update(
				() => {
					const root = $getRoot();
					root.clear();
					const p = $createParagraphNode();
					const text = $createTextNode("foo");
					p.append(text);
					root.append(p);
					text.selectEnd();
				},
				{ onUpdate: resolve },
			);
		});

		await new Promise<void>((resolve) => {
			editor.update(
				() => {
					const selection = $getSelection();
					if (!$isRangeSelection(selection)) return;
					selection.insertNodes([$createLineBreakNode()]);
				},
				{ onUpdate: resolve },
			);
		});

		const paragraphs = readParagraphs(editor);
		expect(paragraphs).toEqual(["foo", ""]);

		editor.getEditorState().read(() => {
			const selection = $getSelection();
			expect($isRangeSelection(selection)).toBe(true);
			if (!$isRangeSelection(selection)) return;

			const anchorNode = selection.anchor.getNode();
			const anchorParagraph = $isParagraphNode(anchorNode)
				? anchorNode
				: anchorNode.getParent();
			const allParagraphs = $getRoot().getChildren();
			expect(anchorParagraph?.getKey()).toBe(allParagraphs[1]?.getKey());
		});
	});

	test("every final paragraph has exactly one TextNode child (or none)", async () => {
		const editor = createTestEditor();
		registerLineBreakNormalization(editor);
		await seedParagraphWithLineBreaks(editor, [
			"Negroni",
			"3 cl gin",
			"3 cl campari",
		]);

		editor.getEditorState().read(() => {
			for (const child of $getRoot().getChildren()) {
				if (!$isParagraphNode(child)) continue;
				const children = child.getChildren();
				expect(children.length).toBeLessThanOrEqual(1);
				if (children.length === 1) {
					expect($isTextNode(children[0])).toBe(true);
				}
			}
		});
	});
});
