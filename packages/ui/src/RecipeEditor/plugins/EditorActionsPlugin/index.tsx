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
import { Tooltip } from "../../../Tooltip";
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
		<EntityActions gap={1} className={styles.actions}>
			{(actionProps) => (
				<>
					<li>
						<ButtonGroup>
							<Tooltip
								as={Button}
								label="Undo"
								{...actionProps}
								className={styles.button}
								onClick={canUndo ? undo : undefined}
								aria-disabled={!canUndo}
							>
								<Icon name="undo" size={2} />
							</Tooltip>

							<Tooltip
								as={Button}
								label="Redo"
								{...actionProps}
								className={styles.button}
								onClick={canRedo ? redo : undefined}
								aria-disabled={!canRedo}
							>
								<Icon name="redo" size={2} />
							</Tooltip>
						</ButtonGroup>
					</li>

					<li>
						<Tooltip
							as={Button}
							label="Clear editor"
							{...actionProps}
							color="red"
							onClick={clear}
						>
							<Icon name="trash" size={1} />
						</Tooltip>
					</li>

					<li>
						<Tooltip
							as={Button}
							label="Round quantities"
							{...actionProps}
							onClick={() => applyTransform(roundLine)}
						>
							<Text size={3}>≈</Text>
						</Tooltip>
					</li>

					<li>
						<Tooltip
							as={Button}
							label="Capitalize"
							{...actionProps}
							onClick={() => applyTransform(capitalizeLine)}
						>
							<Icon name="letter-case-capitalize" size={2} />
						</Tooltip>
					</li>

					<Flex as="li" gap={1} alignItems="center" wrap>
						<ButtonGroup>
							<Tooltip
								as={Button}
								label="Convert to Metric"
								{...actionProps}
								className={styles.button}
								onClick={() =>
									applyTransform((line) => convertLine(line, "metric"))
								}
							>
								Metric
							</Tooltip>

							<Tooltip
								as={Button}
								label="Convert to Imperial"
								{...actionProps}
								className={styles.button}
								onClick={() =>
									applyTransform((line) => convertLine(line, "imperial"))
								}
							>
								Imperial
							</Tooltip>
						</ButtonGroup>
					</Flex>
				</>
			)}
		</EntityActions>
	);
}
