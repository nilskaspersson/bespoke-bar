import type { DraftRecipe } from "@/db/schema/recipes";
import { RecipeName } from "@/features/recipes/components/RecipeName";
import { SpecEntry } from "@/features/specs/components/SpecEntry";

import { GradientText } from "@/ui/GradientText";
import { Heading } from "@/ui/Heading";

export function RecipeCard<T extends DraftRecipe>(props: { recipe: T }) {
	return (
		<div>
			<Heading level="h3">
				<GradientText>
					<RecipeName recipe={props.recipe} />
				</GradientText>
			</Heading>

			{props.recipe.specs ? (
				<ul>
					{props.recipe.specs.map((spec) => (
						<li key={spec.id}>
							<SpecEntry spec={spec} />
						</li>
					))}
				</ul>
			) : null}
		</div>
	);
}
