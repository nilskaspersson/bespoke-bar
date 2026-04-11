"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";
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
