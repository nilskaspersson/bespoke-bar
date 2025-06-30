"use client";

import { clsx } from "clsx";
import { type HTMLAttributes, useState } from "react";
import type { Ingredient } from "@/db/schema/ingredients";
import type { BaseRecipe, Recipe } from "@/db/schema/recipes";
import type { DraftSpecWithDraftIngredient } from "@/db/schema/specs";
import { SpecEntry } from "@/features/specs/components/SpecEntry";
import { userInputToSpec } from "@/features/specs/utils/userInputToSpec";
import { Button } from "@/ui/Button";
import { getKey, type Keyed, withKey } from "@/utils/withKey";
import styles from "./styles.module.css";

export function DraftSpecs({
	className,
	createRecipes,
	ingredients,
	...props
}: {
	createRecipes: (recipes: BaseRecipe[]) => Promise<Recipe[]>;
	ingredients: Ingredient[];
} & HTMLAttributes<HTMLDivElement>) {
	const [specs, setSpecs] = useState<Keyed<DraftSpecWithDraftIngredient>[]>([]);

	const handleSubmit = (formData: FormData) => {
		const entry = formData.get("spec");

		if (entry) {
			const spec = userInputToSpec(entry.toString(), ingredients);

			if (!spec) return;

			setSpecs((prev) => [...prev, withKey(spec)]);
		}
	};

	const createChangeHandler =
		(spec: Keyed<DraftSpecWithDraftIngredient>) =>
		(o: DraftSpecWithDraftIngredient) => {
			setSpecs((prev) =>
				prev.map((s) => (getKey(s) === getKey(spec) ? withKey(o) : s)),
			);
		};

	const createRecipesAction = () => {
		const recipes: BaseRecipe[] = [
			{
				specs,
			},
		];

		createRecipes(recipes);
	};

	return (
		<div {...props} className={clsx(styles.container, className)}>
			{specs.length > 0 ? (
				<form action={createRecipesAction}>
					<ul className={styles.box}>
						{specs.map((spec) => (
							<li key={getKey(spec)}>
								<SpecEntry spec={spec} onChange={createChangeHandler(spec)} />
							</li>
						))}
					</ul>

					<Button type="submit">Save Recipe</Button>
				</form>
			) : null}

			<form action={handleSubmit} className={styles.form}>
				<input type="text" name="spec" className={styles.input} />
			</form>
		</div>
	);
}
