"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
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
				 * ParagraphBreakPlugin guarantees one paragraph per logical line
				 * (Enter creates a new paragraph; any LineBreakNode introduced
				 * by paste/drop is normalized into a split). So each paragraph's
				 * text is one line — transform in place, preserving paragraph
				 * node identity so history and selection stay coherent.
				 */
				for (const node of $getRoot().getChildren()) {
					if (!$isParagraphNode(node)) continue;
					const text = node.getTextContent();
					const result = transform(text);
					if (result === text) continue;
					for (const child of node.getChildren()) child.remove();
					if (result) node.append($createTextNode(result));
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
					<li className={styles.separator}>
						<Button
							{...actionProps}
							color="red"
							onClick={clear}
							title="Clear editor"
						>
							<Icon name="trash" size={2} />
						</Button>
					</li>

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

					<Flex as="li" gap={1} alignItems="center" wrap>
						<Text size={0} light compact>
							Convert to
						</Text>

						<ButtonGroup alignItems="center">
							<Button
								{...actionProps}
								className={styles.button}
								title="Convert to metric"
								onClick={() =>
									applyTransform((line) => convertLine(line, "metric"))
								}
							>
								Metric
							</Button>

							<Button
								{...actionProps}
								className={styles.button}
								title="Convert to imperial"
								onClick={() =>
									applyTransform((line) => convertLine(line, "imperial"))
								}
							>
								Imperial
							</Button>
						</ButtonGroup>
					</Flex>
				</>
			)}
		</EntityActions>
	);
}
