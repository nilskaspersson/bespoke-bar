"use client";

import { clsx } from "clsx";
import {
	type HTMLAttributes,
	useDeferredValue,
	useMemo,
	useState,
} from "react";
import type { DraftRecipe, Recipe } from "@/db/schema/recipes";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { userInputToBulkRecipe } from "@/features/specs/utils/userInputToBulkRecipe";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";
import { type WithID, withID } from "@/utils/withId";
import styles from "./styles.module.css";

export function BulkDraftRecipes({
	createRecipes,
	className,
	...props
}: {
	createRecipes: (recipes: DraftRecipe[]) => Promise<Recipe["id"][]>;
} & HTMLAttributes<HTMLDivElement>) {
	const [inputValue, setInputValue] = useState("");
	const deferredInputValue = useDeferredValue(inputValue);

	const draftRecipes: WithID<DraftRecipe>[] = useMemo(
		() => userInputToBulkRecipe(deferredInputValue).map(withID),
		[deferredInputValue],
	);

	return (
		<section {...props} className={clsx(className, styles.layout)}>
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
					<div>
						{draftRecipes.map((recipe) => (
							<RecipeCard key={recipe.id} recipe={recipe} />
						))}

						<form action={() => void createRecipes(draftRecipes)}>
							<Button type="submit">
								{draftRecipes.length > 1 ? "Save Recipes" : "Save Recipe"}
							</Button>
						</form>
					</div>
				) : null}
			</div>
		</section>
	);
}
