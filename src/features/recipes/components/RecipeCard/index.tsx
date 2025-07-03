import { clsx } from "clsx";
import type { ReactNode } from "react";
import type { BaseRecipe } from "@/db/schema/recipes";
import { SpecsList } from "@/features/specs/components/SpecsList";
import type { UnitSystems } from "@/features/units/utils/convert";
import { Grid } from "@/ui/Grid";
import styles from "./styles.module.css";

export function RecipeCard<T extends BaseRecipe>({
	recipe,
	header,
	tools,
	servings,
	withConversionSystem,
	className,
}: {
	recipe: T;
	header?: ReactNode;
	tools?: ReactNode;
	servings?: number;
	withConversionSystem?: UnitSystems | null;
	className?: string;
}) {
	if (!recipe.specs || recipe.specs.length === 0) {
		return null;
	}

	return (
		<div className={clsx(styles.base, className)}>
			<Grid className={styles.card} gap={3}>
				{header}

				<SpecsList
					specs={recipe.specs}
					className={styles.specs}
					servings={servings}
					convertUnits={withConversionSystem}
				/>
			</Grid>

			{tools ? <aside className={styles.tools}>{tools}</aside> : null}
		</div>
	);
}
