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
import { Flex } from "@/ui/Flex";
import { Icon } from "@/ui/Icon";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

export function EditorActionsPlugin() {
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
		<Flex gap={2} alignItems="center" className={styles.actions}>
			<Flex gap={1} alignItems="center">
				<Text light size={0}>
					Convert
				</Text>
				<Button
					variant="ghost"
					size="tiny"
					onClick={() => applyTransform((line) => convertLine(line, "metric"))}
				>
					<Icon name="arrow-rotate-right" size={1} />
					Metric
				</Button>
				<Button
					variant="ghost"
					size="tiny"
					onClick={() =>
						applyTransform((line) => convertLine(line, "imperial"))
					}
				>
					<Icon name="arrow-rotate-right" size={1} />
					Imperial
				</Button>
			</Flex>

			<div className={styles.separator} />

			<Flex gap={1} alignItems="center">
				<Button
					variant="ghost"
					size="tiny"
					onClick={() => applyTransform(roundLine)}
				>
					<Icon name="arrow-rotate-left" size={1} />
					Round
				</Button>
				<Button
					variant="ghost"
					size="tiny"
					onClick={() => applyTransform(capitalizeLine)}
				>
					<Icon name="pen" size={1} />
					Capitalize
				</Button>
			</Flex>

			<div className={styles.separator} />

			<Button variant="ghost" size="tiny" color="red" onClick={clear}>
				<Icon name="trash" size={2} />
			</Button>
		</Flex>
	);
}
