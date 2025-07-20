"use client";

import { clsx } from "clsx";
import {
	type HTMLAttributes,
	type ReactNode,
	useDeferredValue,
	useMemo,
	useState,
} from "react";
import z from "zod/v4";
import { type RecipeFormData, recipeFormSchema } from "@/db/schema/composite";
import type { Ingredient } from "@/db/schema/ingredients";
import type { BaseRecipe, Recipe } from "@/db/schema/recipes";
import { DraftRecipeCard } from "@/features/recipes/components/DraftRecipeCard";
import { RecipeName } from "@/features/recipes/components/RecipeName";
import { SelectUnitConversion } from "@/features/recipes/components/SelectUnitConversion";
import { getRecipeUrl, isEmptyDraftRecipe } from "@/features/recipes/utils";
import { userInputToBulkRecipe } from "@/features/specs/utils/userInputToBulkRecipe";
import type { UnitSystems } from "@/features/units/utils/convert";
import { Button, LinkButton } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import { Input } from "@/ui/Input";
import { Lightbox } from "@/ui/Lightbox";
import { SubmitButton } from "@/ui/SubmitButton";
import { Text } from "@/ui/Text";
import { ToastActions, toast } from "@/ui/Toast";
import { getKey, type Keyed, withKey } from "@/utils/withKey";
import styles from "./styles.module.css";

export function BulkDraftRecipes({
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
		const data = z.array(recipeFormSchema).parse(
			draftRecipes.map(({ specs, ...recipe }) => ({
				recipe,
				specs,
			})),
		);

		const promise = createRecipes(data).then((recipes) => {
			setInputValue("");
			return recipes;
		});

		const toastId = Date.now().toString();

		toast.promise(promise, {
			id: toastId,
			loading: "Creating recipes…",
			success: (recipes) => ({
				message:
					recipes.length === 1
						? "Recipe created"
						: `${recipes.length} recipes created`,
				description:
					recipes.length === 1 ? (
						"Visit the recipe page to continue adding details."
					) : (
						<Text as="ul" list>
							{recipes.map((recipe) => (
								<li key={getKey(recipe)}>
									<LinkButton
										variant="text"
										size="tiny"
										color="accent"
										href={getRecipeUrl(recipe)}
										prefetch={true}
										onClick={() => toast.dismiss(toastId)}
									>
										<RecipeName recipe={recipe} />
									</LinkButton>
								</li>
							))}
						</Text>
					),
				action: (
					<ToastActions>
						<LinkButton
							size="tiny"
							href="/bar/recipes"
							variant="ghost"
							color="heavy"
							prefetch={false}
						>
							All recipes
						</LinkButton>

						{recipes.length === 1 ? (
							<LinkButton
								size="tiny"
								href={getRecipeUrl(recipes[0])}
								variant="solid"
								color="accent"
								prefetch={true}
								onClick={() => toast.dismiss(toastId)}
							>
								View recipe
								<Icon name="angles-right" size={0} />
							</LinkButton>
						) : null}
					</ToastActions>
				),
			}),
			error: () => "Recipe could not be created",
		});
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
