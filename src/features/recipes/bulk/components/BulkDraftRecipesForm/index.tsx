"use client";

import { clsx } from "clsx";
import {
	type HTMLAttributes,
	type ReactNode,
	useDeferredValue,
	useState,
} from "react";
import type { RecipeFormData } from "@/db/schema/composite";
import type { Ingredient } from "@/db/schema/ingredients";
import type { Recipe } from "@/db/schema/recipes";
import { DraftRecipeCard } from "@/features/recipes/bulk/components/DraftRecipeCard";
import { useCreateBulkDraftRecipes } from "@/features/recipes/bulk/hooks/useCreateBulkDraftRecipes";
import { useBulkDraftTextToBaseRecipes } from "@/features/recipes/bulk/hooks/useFormatBulkDraftRecipes";
import { SelectUnitConversion } from "@/features/recipes/components/SelectUnitConversion";
import type { UnitSystems } from "@/features/units/utils/convert";
import { Button } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import { TextArea } from "@/ui/Input";
import { Lightbox } from "@/ui/Lightbox";
import { SubmitButton } from "@/ui/SubmitButton";
import { Text } from "@/ui/Text";

import { getKey } from "@/utils/withKey";
import styles from "./styles.module.css";

export function BulkDraftRecipesForm({
	className,
	empty,
	ingredients,
	createRecipes,
	...props
}: {
	ingredients: Ingredient[];
	empty?: ReactNode;
	createRecipes: (recipes: RecipeFormData[]) => Promise<Recipe[]>;
} & Omit<HTMLAttributes<HTMLFormElement>, "action" | "children">) {
	const [withConversionSystem, setWithConversionSystem] =
		useState<UnitSystems | null>(null);

	const [isExpanded, setIsExpanded] = useState(false);
	const [draftValue, setDraftValue] = useState("");
	const deferredDraftValue = useDeferredValue(draftValue);

	const draftRecipes = useBulkDraftTextToBaseRecipes(
		deferredDraftValue,
		ingredients,
	);

	const formAction = useCreateBulkDraftRecipes(draftRecipes, createRecipes);

	return (
		<form
			{...props}
			className={clsx(className, styles.form)}
			action={formAction}
		>
			<SelectUnitConversion
				name="unitConversionSystem"
				onChange={setWithConversionSystem}
				defaultValue={withConversionSystem}
			/>

			<div>
				{draftRecipes.length === 0 ? (
					empty
				) : (
					<ul className={styles.recipes}>
						{draftRecipes.map((recipe) => (
							<li key={getKey(recipe)} className={styles.recipe}>
								<DraftRecipeCard
									recipe={recipe}
									convertUnits={withConversionSystem}
								/>
							</li>
						))}
					</ul>
				)}
			</div>

			<Lightbox
				className={clsx(styles.act, { [styles.isExpanded]: isExpanded })}
			>
				<div className={styles.actions}>
					<Button
						icon
						className={styles.expand}
						onClick={() => setIsExpanded((prev) => !prev)}
						aria-label={isExpanded ? "Collapse" : "Expand"}
					>
						<Icon name={isExpanded ? "collapse" : "expand"} size={1} />
					</Button>

					<div className={styles.label}>
						<Text heavy size={1} compact weight={600} align="center">
							{draftRecipes.length > 0 ? (
								<>
									{draftRecipes.length}{" "}
									{draftRecipes.length > 1 ? "recipes" : "recipe"}
								</>
							) : (
								"Create recipes"
							)}
						</Text>
					</div>

					<SubmitButton variant="text" color="heavy" className={styles.create}>
						Create
					</SubmitButton>
				</div>

				<TextArea
					name="draft"
					rows={3}
					value={draftValue}
					placeholder="Start typing to create recipes…"
					onChange={(e) => setDraftValue(e.target.value)}
					fullWidth
				/>
			</Lightbox>
		</form>
	);
}
