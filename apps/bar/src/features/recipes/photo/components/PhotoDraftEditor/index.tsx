"use client";

import type { Ingredient } from "@bespoke/schema/schema/ingredients";
import { DraftRecipesStatusBar } from "@bespoke/ui/DraftRecipesStatusBar";
import { Icon } from "@bespoke/ui/Icon";
import { RecipeEditor } from "@bespoke/ui/RecipeEditor";
import { Text } from "@bespoke/ui/Text";
import { clsx } from "clsx";
import type { ComponentProps } from "react";
import type { PhotoFlow } from "@/features/recipes/photo/hooks/usePhotoFlow";
import styles from "./styles.module.css";

export function PhotoDraftEditor({
	flow,
	ingredients,
	className,
	...props
}: { flow: PhotoFlow; ingredients: Ingredient[] } & Omit<
	ComponentProps<"div">,
	"children"
>) {
	return (
		<div {...props} className={clsx(className, styles.root)}>
			{flow.hasParsedText ? (
				<RecipeEditor
					key={flow.ocrText}
					ingredients={ingredients}
					initialText={flow.draftText || flow.ocrText}
					onTextChange={flow.onDraftTextChange}
					statusBar={<DraftRecipesStatusBar recipes={flow.draftRecipes} />}
				/>
			) : (
				<div
					className={clsx(styles.placeholder, {
						[styles.reading]: flow.isParsing,
					})}
				>
					<div className={styles.lines} aria-hidden>
						<span />
						<span />
						<span />
						<span />
					</div>

					<Icon name="duotone-input-text" size={6} className={styles.icon} />

					<Text as="p" size={2} align="center" balance>
						{flow.isParsing
							? "Reading your photo…"
							: "The text from your photo lands here, ready to correct."}
					</Text>
				</div>
			)}
		</div>
	);
}
