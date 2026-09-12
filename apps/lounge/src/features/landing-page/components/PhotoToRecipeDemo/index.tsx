"use client";

import { userInputToBulkRecipe } from "@bespoke/domain/ingredientLines/userInputToBulkRecipe";
import { isEmptyDraftRecipe } from "@bespoke/domain/recipes/predicates";
import type { BaseRecipe } from "@bespoke/schema/schema/recipes";
import { Flex } from "@bespoke/ui/Flex";
import { Icon } from "@bespoke/ui/Icon";
import { TextArea } from "@bespoke/ui/Input";
import { Panel } from "@bespoke/ui/Panel";
import { Text } from "@bespoke/ui/Text";
import {
	type ReactNode,
	useDeferredValue,
	useId,
	useMemo,
	useState,
} from "react";
import { DraftRecipeCard } from "@/features/landing-page/components/DraftRecipeCard";
import styles from "./styles.module.css";

const NO_INGREDIENTS: never[] = [];

function parseRecipe(text: string): BaseRecipe | undefined {
	return userInputToBulkRecipe(text, NO_INGREDIENTS).find(
		(candidate) => !isEmptyDraftRecipe(candidate),
	);
}

function Arrow() {
	return (
		<Icon
			name="arrow-right"
			size={6}
			className={styles.arrow}
			aria-hidden="true"
		/>
	);
}

export function PhotoToRecipeDemo({
	photo,
	initialText,
	initialRecipe,
}: {
	photo: ReactNode;
	initialText: string;
	initialRecipe: BaseRecipe | undefined;
}) {
	const [text, setText] = useState(initialText);
	const deferredText = useDeferredValue(text);
	const labelId = useId();

	const recipe = useMemo(
		() =>
			deferredText === initialText ? initialRecipe : parseRecipe(deferredText),
		[deferredText, initialText, initialRecipe],
	);

	return (
		<div className={styles.base}>
			{photo}

			<Arrow />

			<Panel
				className={styles.panel}
				header={
					<Flex gap={2} alignItems="center">
						<Icon
							name="duotone-input-text"
							size={3}
							className={styles.titleIcon}
						/>

						<Text id={labelId} size={1} weight={600}>
							2. Extracted text
						</Text>
					</Flex>
				}
				box={
					<TextArea
						inline
						fullWidth
						aria-labelledby={labelId}
						spellCheck={false}
						autoComplete="off"
						autoCorrect="off"
						value={text}
						onChange={(event) => setText(event.target.value)}
						className={styles.input}
					/>
				}
				footer={
					<Flex gap={2} alignItems="center">
						<Icon name="circle-info" size={1} />
						<Text size={1}>Edit to fix any mistakes</Text>
					</Flex>
				}
			/>

			<Arrow />

			<Panel
				className={styles.panel}
				header={
					<Flex gap={2} alignItems="center">
						<Icon name="martini-glass" size={3} className={styles.titleIcon} />

						<Text size={1} weight={600}>
							3. Preview
						</Text>
					</Flex>
				}
				box={
					recipe ? (
						<DraftRecipeCard recipe={recipe} className={styles.card} />
					) : (
						<Text as="p" size={1} light className={styles.empty}>
							Type a recipe to see the preview.
						</Text>
					)
				}
			/>
		</div>
	);
}
