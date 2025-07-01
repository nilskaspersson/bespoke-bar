import type { BaseRecipe } from "@/db/schema/recipes";
import { RecipeName } from "@/features/recipes/components/RecipeName";
import { isEmptyDraftRecipe } from "@/features/recipes/utils";
import { AbvInfo } from "@/features/specs/components/AbvInfo";
import { SpecEntry } from "@/features/specs/components/SpecEntry";
import { VolumeInfo } from "@/features/specs/components/VolumeInfo";
import type { UnitSystems } from "@/features/units/utils/convert";
import { Flex } from "@/ui/Flex";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import { getKey } from "@/utils/withKey";
import styles from "./styles.module.css";

export function DraftRecipeCard<T extends BaseRecipe>(props: {
	recipe: T;
	convertUnits?: UnitSystems | null;
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
					<Grid as="ul" gap={1}>
						{props.recipe.specs.map((spec) => (
							<li key={getKey(spec)}>
								<SpecEntry spec={spec} convertUnits={props.convertUnits} />
							</li>
						))}
					</Grid>

					<Grid gap={1}>
						<AbvInfo recipe={props.recipe} />
						<VolumeInfo recipe={props.recipe} />
					</Grid>
				</>
			) : null}
		</Grid>
	);
}
