import type { DraftRecipe } from "@/db/schema/recipes";
import { RecipeName } from "@/features/recipes/components/RecipeName";
import { SpecEntry } from "@/features/specs/components/SpecEntry";

import { GradientText } from "@/ui/GradientText";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { KEY_NAME } from "@/utils/withKey";

export function RecipeCard<T extends DraftRecipe>(props: { recipe: T }) {
	return (
		<Grid gap={2}>
			<Heading level="h3" size={6}>
				<GradientText>
					<RecipeName recipe={props.recipe} />
				</GradientText>
			</Heading>

			{props.recipe.specs ? (
				<Grid as="ul" gap={1}>
					{props.recipe.specs.map((spec) => (
						<li key={spec[KEY_NAME]}>
							<SpecEntry spec={spec} />
						</li>
					))}
				</Grid>
			) : null}
		</Grid>
	);
}
