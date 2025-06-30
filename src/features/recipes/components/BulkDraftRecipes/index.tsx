"use client";

import { clsx } from "clsx";
import {
	type HTMLAttributes,
	type ReactNode,
	useDeferredValue,
	useMemo,
	useState,
} from "react";
import type { Ingredient } from "@/db/schema/ingredients";
import type { BaseRecipe, Recipe } from "@/db/schema/recipes";
import { DraftRecipeCard } from "@/features/recipes/components/DraftRecipeCard";
import { SelectUnitConversion } from "@/features/recipes/components/SelectUnitConversion";
import { isEmptyDraftRecipe } from "@/features/recipes/utils";
import { userInputToBulkRecipe } from "@/features/specs/utils/userInputToBulkRecipe";
import type { UnitSystems } from "@/features/units/utils/convert";
import { Button } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import { Input } from "@/ui/Input";
import { Lightbox } from "@/ui/Lightbox";
import { SubmitButton } from "@/ui/SubmitButton";
import { Text } from "@/ui/Text";
import { getKey, type Keyed, withKey } from "@/utils/withKey";
import styles from "./styles.module.css";

export function BulkDraftRecipes({
	createRecipes,
	className,
	empty,
	ingredients,
	...props
}: {
	createRecipes: (recipes: BaseRecipe[]) => Promise<Recipe[]>;
	ingredients: Ingredient[];
	empty?: ReactNode;
} & Omit<HTMLAttributes<HTMLFormElement>, "action" | "children">) {
	const [withConversionSystem, setWithConversionSystem] =
		useState<UnitSystems | null>(null);
	const [isExpanded, setIsExpanded] = useState(false);

	const [inputValue, setInputValue] = useState("");
	const deferredInputValue = useDeferredValue(inputValue);

	const draftRecipes: Keyed<BaseRecipe>[] = useMemo(
		() =>
			userInputToBulkRecipe(deferredInputValue, ingredients)
				.filter((recipe) => !isEmptyDraftRecipe(recipe))
				.map(withKey),
		[deferredInputValue, ingredients],
	);

	const formAction = async () => {
		await createRecipes(draftRecipes);
		setInputValue("");
	};

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
				translucent
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

				<Input
					as="textarea"
					name="draft"
					rows={3}
					value={inputValue}
					placeholder="Start typing to create recipes…"
					onChange={(e) => setInputValue(e.target.value)}
					fullWidth
				/>
			</Lightbox>
		</form>
	);
}
