"use client";

import { type ReactNode, use, useDeferredValue, useState } from "react";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { RecipeNameAdornment } from "@/features/recipes/components/RecipeNameAdornment";
import { SelectServings } from "@/features/recipes/components/SelectServings";
import { SelectUnitConversion } from "@/features/recipes/components/SelectUnitConversion";
import { RecipeMetrics } from "@/features/recipes/metrics/components/RecipeMetrics";
import type { UnitSystems } from "@/features/units/utils/convert";
import { FormatterContext } from "@/hooks/useFormatter";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

export function RecipeInfo<T extends RecipeWithSpecs>({
	children,
	recipe,
}: {
	children?: ReactNode;
	recipe: T;
}) {
	const { quantityFormatter } = use(FormatterContext);

	const [servings, setServings] = useState(1);
	const deferredServings = useDeferredValue(servings);

	const [withConversionSystem, setWithConversionSystem] =
		useState<UnitSystems | null>(null);

	if (!recipe.specs || recipe.specs.length === 0) {
		return null;
	}

	return (
		<div className={styles.base}>
			<section className={styles.primary}>
				<RecipeCard
					recipe={recipe}
					className={styles.card}
					servings={servings}
					convertUnits={withConversionSystem}
					withLink={false}
					nameAdornment={<RecipeNameAdornment servings={deferredServings} />}
				>
					<Text as="div" size={1} fullWidth className={styles.count}>
						Servings: {quantityFormatter.format(servings)}
					</Text>

					{children}
				</RecipeCard>
			</section>

			<aside className={styles.card}>
				<Heading level="h2" size={4} className={styles.heading}>
					Stats & Settings
				</Heading>

				<Grid gap={4}>
					<SelectUnitConversion
						name="withConversionSystem"
						defaultValue={withConversionSystem}
						onChange={setWithConversionSystem}
					/>

					<SelectServings value={deferredServings} onChange={setServings} />

					<RecipeMetrics
						recipe={recipe}
						servings={deferredServings}
						convertUnits={withConversionSystem}
					/>
				</Grid>
			</aside>
		</div>
	);
}
