"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";
import { useCallback } from "react";
import {
	capitalizeLine,
	convertLine,
	roundLine,
} from "@/features/recipes/bulk/utils/transformRecipeText";
import { Button } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

export function EditorActionsPlugin({
	children,
}: {
	children?: React.ReactNode;
}) {
	const [editor] = useLexicalComposerContext();

	const applyTransform = useCallback(
		(transform: (line: string) => string) => {
			editor.update(() => {
				const root = $getRoot();
				let changed = false;
				const results: string[] = [];

				for (const node of root.getChildren()) {
					const text = node.getTextContent();
					for (const line of text.split("\n")) {
						const result = transform(line);
						if (result !== line) changed = true;
						results.push(result);
					}
				}

				if (!changed) return;

				root.clear();
				for (const line of results) {
					const p = $createParagraphNode();
					if (line) p.append($createTextNode(line));
					root.append(p);
				}
			});
		},
		[editor],
	);

	const clear = useCallback(() => {
		editor.update(() => {
			const root = $getRoot();
			root.clear();
			root.append($createParagraphNode());
		});
	}, [editor]);

	return (
		<div className={styles.actions}>
			<Text light size={0}>
				Transform
			</Text>

			<Button
				variant="ghost"
				size="tiny"
				onClick={() => applyTransform((line) => convertLine(line, "metric"))}
			>
				Metric
			</Button>
			<Button
				variant="ghost"
				size="tiny"
				onClick={() => applyTransform((line) => convertLine(line, "imperial"))}
			>
				Imperial
			</Button>
			<Button
				variant="ghost"
				size="tiny"
				onClick={() => applyTransform(roundLine)}
			>
				Round
			</Button>
			<Button
				variant="ghost"
				size="tiny"
				onClick={() => applyTransform(capitalizeLine)}
			>
				Capitalize
			</Button>
			<Button variant="ghost" size="tiny" color="red" onClick={clear}>
				<Icon name="trash" size={2} />
			</Button>

			{children ? (
				<>
					<div className={styles.separator} />
					{children}
				</>
			) : null}
		</div>
	);
}
