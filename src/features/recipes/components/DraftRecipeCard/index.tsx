import type { BaseRecipe } from "@/db/schema/recipes";
import { AbvInfo } from "@/features/recipes/components/AbvInfo";
import { RecipeName } from "@/features/recipes/components/RecipeName";
import { VolumeInfo } from "@/features/recipes/components/VolumeInfo";
import { isEmptyDraftRecipe } from "@/features/recipes/utils";
import { SpecEntry } from "@/features/specs/components/SpecEntry";
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
					<ul className={styles.specs}>
						{props.recipe.specs.map((spec) => (
							<li key={getKey(spec)} className={styles.spec}>
								<SpecEntry
									className={styles.entry}
									spec={spec}
									convertUnits={props.convertUnits}
								/>
							</li>
						))}
					</ul>

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
