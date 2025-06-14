"use client";

import { clsx } from "clsx";
import {
	type HTMLAttributes,
	useDeferredValue,
	useMemo,
	useState,
} from "react";
import type { DraftRecipe, RecipeWithSpecs } from "@/db/schema/recipes";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { userInputToBulkRecipe } from "@/features/specs/utils/userInputToBulkRecipe";
import { Grid } from "@/ui/Grid";
import { Input } from "@/ui/Input";
import { SubmitButton } from "@/ui/SubmitButton";
import { KEY_NAME, type WithKey, withKey } from "@/utils/withKey";
import styles from "./styles.module.css";

export function BulkDraftRecipes({
	createRecipes,
	className,
	...props
}: {
	createRecipes: (recipes: DraftRecipe[]) => Promise<RecipeWithSpecs[]>;
} & Omit<HTMLAttributes<HTMLFormElement>, "action" | "children">) {
	const [inputValue, setInputValue] = useState("");
	const deferredInputValue = useDeferredValue(inputValue);

	const draftRecipes: WithKey<DraftRecipe>[] = useMemo(
		() => userInputToBulkRecipe(deferredInputValue).map(withKey),
		[deferredInputValue],
	);

	const formAction = async () => {
		await createRecipes(draftRecipes);
		setInputValue("");
	};

	return (
		<form
			{...props}
			className={clsx(className, styles.layout)}
			action={formAction}
		>
			<div>
				<Input
					as="textarea"
					name="draft"
					rows={10}
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
				/>
			</div>

			<div>
				{draftRecipes.length > 0 ? (
					<Grid gap={6}>
						<Grid as="ul" gap={6}>
							{draftRecipes.map((recipe) => (
								<li key={recipe[KEY_NAME]}>
									<RecipeCard recipe={recipe} />
								</li>
							))}
						</Grid>

						<SubmitButton>
							{draftRecipes.length > 1 ? "Save Recipes" : "Save Recipe"}
						</SubmitButton>
					</Grid>
				) : null}
			</div>
		</form>
	);
}
