"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	$createLineBreakNode,
	$createParagraphNode,
	$createTextNode,
	$getRoot,
	$isParagraphNode,
} from "lexical";
import { useCallback } from "react";
import { EntityActions } from "@/components/EntityActions";
import {
	capitalizeLine,
	convertLine,
	roundLine,
} from "@/features/recipes/bulk/utils/transformRecipeText";
import { Button } from "@/ui/Button";
import { ButtonGroup } from "@/ui/ButtonGroup";
import { Flex } from "@/ui/Flex";
import { Icon } from "@/ui/Icon";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

export function EditorActionsPlugin() {
	const [editor] = useLexicalComposerContext();

	const applyTransform = useCallback(
		(transform: (line: string) => string) => {
			editor.update(() => {
				/**
				 * ParagraphBreakPlugin turns Enter into a paragraph split, but
				 * plain-text paste still lands as one paragraph with
				 * LineBreakNodes between lines (see `insertRawText` in Lexical).
				 * So a paragraph may hold multiple logical lines, and the
				 * transform runs per *line* — not per paragraph. Rebuild each
				 * paragraph's children as a TextNode / LineBreakNode chain so
				 * the result keeps the same logical-line shape.
				 */
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
		<EntityActions gap={2} className={styles.actions}>
			{(actionProps) => (
				<>
					<Flex as="li" gap={1} alignItems="center">
						<Text size={0} light compact>
							Convert to
						</Text>

						<ButtonGroup alignItems="center">
							<Button
								{...actionProps}
								variant="outline"
								onClick={() =>
									applyTransform((line) => convertLine(line, "metric"))
								}
							>
								Metric
							</Button>

							<Button
								{...actionProps}
								variant="outline"
								onClick={() =>
									applyTransform((line) => convertLine(line, "imperial"))
								}
							>
								Imperial
							</Button>
						</ButtonGroup>
					</Flex>

					<li>
						<Button {...actionProps} onClick={() => applyTransform(roundLine)}>
							Round values
						</Button>
					</li>

					<li>
						<Button
							{...actionProps}
							onClick={() => applyTransform(capitalizeLine)}
						>
							Capitalize
						</Button>
					</li>

					<li>
						<Button {...actionProps} color="red" onClick={clear}>
							<Icon name="trash" size={2} />
						</Button>
					</li>
				</>
			)}
		</EntityActions>
	);
}
