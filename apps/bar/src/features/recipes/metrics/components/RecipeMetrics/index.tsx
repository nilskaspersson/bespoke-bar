"use client";

import type { UnitSystems } from "@bespoke/domain/units/convert";
import type { BaseRecipe } from "@bespoke/schema/schema/recipes";
import { clsx } from "clsx";
import { type ComponentProps, useState } from "react";
import { AbvInfo } from "@/features/recipes/metrics/components/AbvInfo";
import { CostInfo } from "@/features/recipes/metrics/components/CostInfo";
import { VolumeInfo } from "@/features/recipes/metrics/components/VolumeInfo";
import { Checkbox } from "@/ui/Checkbox";
import { Grid } from "@/ui/Grid";
import styles from "./styles.module.css";

export function RecipeMetrics<T extends BaseRecipe>({
	className,
	recipe,
	servings,
	convertUnits,
	...props
}: {
	recipe: T;
	servings?: number;
	convertUnits?: UnitSystems | null;
} & Omit<ComponentProps<"div">, "children">) {
	const [asDiluted, setAsDiluted] = useState(true);

	return (
		<Grid
			as="aside"
			gap={2}
			className={clsx(className, styles.base)}
			{...props}
		>
			<AbvInfo recipe={recipe} diluted={asDiluted} />

			<VolumeInfo
				diluted={asDiluted}
				recipe={recipe}
				servings={1}
				convertUnits={convertUnits}
			/>

			<VolumeInfo
				diluted={asDiluted}
				recipe={recipe}
				servings={servings}
				convertUnits={convertUnits}
				disabled={typeof servings !== "number" || servings <= 1}
			/>

			<CostInfo
				recipe={recipe}
				servings={servings}
				convertUnits={convertUnits}
			/>

			<hr />

			<Checkbox
				label="With dilution"
				defaultChecked={asDiluted}
				onChange={(event) => setAsDiluted(event.target.checked)}
				size="small"
			/>
		</Grid>
	);
}
