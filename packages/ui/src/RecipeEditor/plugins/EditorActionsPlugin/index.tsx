"use client";

import {
	capitalizeLine,
	convertLine,
	roundLine,
} from "@bespoke/domain/recipes/transformRecipeText";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
	$createParagraphNode,
	$createTextNode,
	$getRoot,
	$isParagraphNode,
	CAN_REDO_COMMAND,
	CAN_UNDO_COMMAND,
	COMMAND_PRIORITY_LOW,
	REDO_COMMAND,
	UNDO_COMMAND,
} from "lexical";
import { useCallback, useEffect, useState } from "react";
import { Button } from "../../../Button";
import { ButtonGroup } from "../../../ButtonGroup";
import { EntityActions } from "../../../EntityActions";
import { Flex } from "../../../Flex";
import { Icon } from "../../../Icon";
import { Text } from "../../../Text";
import styles from "./styles.module.css";

export function EditorActionsPlugin() {
	const [editor] = useLexicalComposerContext();
	const [canUndo, setCanUndo] = useState(false);
	const [canRedo, setCanRedo] = useState(false);

	useEffect(() => {
		return mergeRegister(
			editor.registerCommand(
				CAN_UNDO_COMMAND,
				(payload) => {
					setCanUndo(payload);
					return false;
				},
				COMMAND_PRIORITY_LOW,
			),
			editor.registerCommand(
				CAN_REDO_COMMAND,
				(payload) => {
					setCanRedo(payload);
					return false;
				},
				COMMAND_PRIORITY_LOW,
			),
		);
	}, [editor]);

	const undo = useCallback(() => {
		editor.dispatchCommand(UNDO_COMMAND, undefined);
	}, [editor]);

	const redo = useCallback(() => {
		editor.dispatchCommand(REDO_COMMAND, undefined);
	}, [editor]);

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
						<ButtonGroup>
							<Button
								{...actionProps}
								className={styles.button}
								onClick={canUndo ? undo : undefined}
								aria-disabled={!canUndo}
								title="Undo"
							>
								<Icon name="undo" size={2} />
							</Button>

							<Button
								{...actionProps}
								className={styles.button}
								onClick={canRedo ? redo : undefined}
								aria-disabled={!canRedo}
								title="Redo"
							>
								<Icon name="redo" size={2} />
							</Button>
						</ButtonGroup>
					</li>

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

						<ButtonGroup>
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
