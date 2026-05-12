"use client";

import type { RefObject } from "react";
import type { BaseRecipe } from "@/db/schema/recipes";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { Button } from "@/ui/Button";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { LightboxDialog } from "@/ui/LightboxDialog";
import { Text } from "@/ui/Text";
import { pluralize } from "@/utils/formatting";
import { getKey, type Keyed } from "@/utils/withKey";
import styles from "./styles.module.css";

type Props = {
	dialogRef: RefObject<HTMLDialogElement | null>;
	isOpen: boolean;
	mounted: boolean;
	recipes: Keyed<BaseRecipe>[];
	onClose: () => void;
};

export function PreviewRecipesDialog({
	dialogRef,
	isOpen,
	mounted,
	recipes,
	onClose,
}: Props) {
	return (
		<LightboxDialog ref={dialogRef} isOpen={isOpen} mounted={mounted}>
			<LightboxDialog.Header>
				<Grid gap={2} className={styles.header}>
					<Heading level="h2" size={5}>
						Preview
					</Heading>

					<Text as="p" size={1} light compact numeric>
						{recipes.length} {pluralize(recipes.length, "recipe")}
					</Text>
				</Grid>
			</LightboxDialog.Header>

			<ul className={styles.list}>
				{recipes.map((recipe) => (
					<li key={getKey(recipe)}>
						<RecipeCard recipe={recipe} withLink={false} />
					</li>
				))}
			</ul>

			<LightboxDialog.Footer className={styles.footer}>
				<Button variant="ghost" size="small" onClick={onClose}>
					Close
				</Button>
			</LightboxDialog.Footer>
		</LightboxDialog>
	);
}
