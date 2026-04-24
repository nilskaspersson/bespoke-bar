import type { BaseRecipe } from "@/db/schema/recipes";
import { RecipeName } from "@/features/recipes/components/RecipeName";
import { AbvInfo } from "@/features/recipes/metrics/components/AbvInfo";
import { VolumeInfo } from "@/features/recipes/metrics/components/VolumeInfo";
import { isEmptyDraftRecipe } from "@/features/recipes/utils";
import { SpecsList } from "@/features/specs/components/SpecsList";
import type { UnitSystems } from "@/features/units/utils/convert";
import { Flex } from "@/ui/Flex";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import styles from "./styles.module.css";

export function DraftRecipeCard<T extends BaseRecipe>(props: {
	recipe: T;
	convertUnits?: UnitSystems | null;
	withRounding?: boolean;
}) {
	if (isEmptyDraftRecipe(props.recipe)) {
		return null;
	}

	return (
		<Grid gap={4} className={styles.card}>
			<Flex gap={4} justifyContent="space-between">
				<Heading level="h3" size={5}>
					<RecipeName recipe={props.recipe} />
				</Heading>

				<Icon name="duotone-martini-glass" size={3} className={styles.icon} />
			</Flex>

			{props.recipe.specs && props.recipe.specs.length > 0 ? (
				<>
					<SpecsList
						specs={props.recipe.specs}
						convertUnits={props.convertUnits}
						withRounding={props.withRounding}
					/>

					<Grid gap={1}>
						<AbvInfo recipe={props.recipe} />

						<VolumeInfo
							recipe={props.recipe}
							convertUnits={props.convertUnits}
						/>
					</Grid>
				</>
			) : null}
		</Grid>
	);
}
