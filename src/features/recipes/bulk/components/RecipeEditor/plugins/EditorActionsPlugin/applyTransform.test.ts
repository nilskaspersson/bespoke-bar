import {
	$createLineBreakNode,
	$createParagraphNode,
	$createTextNode,
	$getRoot,
	$isParagraphNode,
	createEditor,
	type LexicalEditor,
} from "lexical";
import { describe, expect, test } from "vitest";
import {
	capitalizeLine,
	convertLine,
	roundLine,
} from "@/features/recipes/bulk/utils/transformRecipeText";

function createTestEditor(): LexicalEditor {
	const editor = createEditor({ namespace: "test", onError: console.error });
	return editor;
}

function seedLines(editor: LexicalEditor, lines: string[]): Promise<void> {
	return new Promise((resolve) => {
		editor.update(
			() => {
				const root = $getRoot();
				root.clear();
				for (const line of lines) {
					const p = $createParagraphNode();
					if (line) p.append($createTextNode(line));
					root.append(p);
				}
			},
			{ onUpdate: resolve },
		);
	});
}

function readLines(editor: LexicalEditor): string[] {
	return editor.getEditorState().read(() =>
		$getRoot()
			.getChildren()
			.map((c) => c.getTextContent()),
	);
}

function applyTransformInPlace(
	editor: LexicalEditor,
	transform: (line: string) => string,
): Promise<void> {
	return new Promise((resolve) => {
		editor.update(
			() => {
				for (const node of $getRoot().getChildren()) {
					if (!$isParagraphNode(node)) continue;
					const text = node.getTextContent();
					const lines = text.split("\n");
					const transformed = lines.map(transform);
					if (lines.every((line, i) => line === transformed[i])) continue;
					for (const child of node.getChildren()) child.remove();
					transformed.forEach((line, i) => {
						if (i > 0) node.append($createLineBreakNode());
						if (line) node.append($createTextNode(line));
					});
				}
			},
			{ onUpdate: resolve },
		);
	});
}

describe("applyTransform in-place", () => {
	test("works when an update listener is also registered (syntax highlight-like)", async () => {
		const editor = createTestEditor();
		editor.registerUpdateListener(({ dirtyLeaves }) => {
			if (dirtyLeaves.size === 0) return;
			editor.getEditorState().read(() => $getRoot().getTextContent());
		});

		await seedLines(editor, [
			"Negroni",
			"3 cl gin",
			"3 cl campari",
			"3 cl sweet vermouth",
		]);

		await applyTransformInPlace(editor, (line) =>
			convertLine(line, "imperial"),
		);

		const lines = readLines(editor);
		expect(lines[0]).toBe("Negroni");
		expect(lines[1]).toContain("fl oz");
		expect(lines[2]).toContain("fl oz");
		expect(lines[3]).toContain("fl oz");
	});

	test("converts every line of a multi-spec recipe to imperial", async () => {
		const editor = createTestEditor();
		await seedLines(editor, [
			"Negroni",
			"3 cl gin",
			"3 cl campari",
			"3 cl sweet vermouth",
		]);

		await applyTransformInPlace(editor, (line) =>
			convertLine(line, "imperial"),
		);

		const lines = readLines(editor);
		expect(lines[0]).toBe("Negroni");
		expect(lines[1]).toContain("fl oz");
		expect(lines[2]).toContain("fl oz");
		expect(lines[3]).toContain("fl oz");
		expect(lines[1]).toContain("gin");
		expect(lines[2]).toContain("campari");
		expect(lines[3]).toContain("sweet vermouth");
	});

	test("rounds every line of a multi-spec recipe", async () => {
		const editor = createTestEditor();
		await seedLines(editor, [
			"Daiquiri",
			"2.33 cl rum",
			"1.1 cl lime juice",
			"0.7 cl syrup",
		]);

		await applyTransformInPlace(editor, roundLine);

		const lines = readLines(editor);
		expect(lines[0]).toBe("Daiquiri");
		expect(lines[1]).not.toContain("2.33");
		expect(lines[2]).not.toContain("1.1");
		expect(lines[3]).not.toContain("0.7");
	});

	test("handles a single paragraph with LineBreakNodes (paste shape)", async () => {
		const editor = createTestEditor();
		await new Promise<void>((resolve) => {
			editor.update(
				() => {
					const root = $getRoot();
					root.clear();
					const p = $createParagraphNode();
					p.append($createTextNode("Negroni"));
					p.append($createLineBreakNode());
					p.append($createTextNode("3 cl gin"));
					p.append($createLineBreakNode());
					p.append($createTextNode("3 cl campari"));
					p.append($createLineBreakNode());
					p.append($createTextNode("3 cl sweet vermouth"));
					root.append(p);
				},
				{ onUpdate: resolve },
			);
		});

		const before = readLines(editor);
		await applyTransformInPlace(editor, (line) =>
			convertLine(line, "imperial"),
		);
		const after = readLines(editor);

		/**
		 * Diagnostic: document what one-paragraph-with-linebreaks looks like
		 * before and after the transform. Paste in plain-text mode produces
		 * this structure.
		 */
		expect(before).toEqual([
			"Negroni\n3 cl gin\n3 cl campari\n3 cl sweet vermouth",
		]);
		expect(after[0]).toContain("fl oz");
		expect(after[0].split("\n").filter((l) => l.includes("fl oz")).length).toBe(
			3,
		);
	});

	test("capitalizes recipe name and every ingredient name", async () => {
		const editor = createTestEditor();
		await seedLines(editor, [
			"old fashioned",
			"6 cl bourbon",
			"2 dashes angostura bitters",
			"1 barspoon simple syrup",
		]);

		await applyTransformInPlace(editor, capitalizeLine);

		const lines = readLines(editor);
		expect(lines[0]).toBe("Old Fashioned");
		expect(lines[1]).toBe("6 cl Bourbon");
		expect(lines[2]).toBe("2 dashes Angostura Bitters");
		expect(lines[3]).toBe("1 barspoon Simple Syrup");
	});
});
