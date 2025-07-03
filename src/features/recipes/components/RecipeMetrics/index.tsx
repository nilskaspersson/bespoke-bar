"use client";

import { clsx } from "clsx";
import { type ComponentProps, useState } from "react";
import type { BaseRecipe } from "@/db/schema/recipes";
import { AbvInfo } from "@/features/specs/components/AbvInfo";
import { VolumeInfo } from "@/features/specs/components/VolumeInfo";
import type { UnitSystems } from "@/features/units/utils/convert";
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
				recipe={recipe}
				diluted={asDiluted}
				servings={1}
				convertUnits={convertUnits}
			/>

			{typeof servings === "number" && servings > 1 ? (
				<VolumeInfo
					recipe={recipe}
					diluted={asDiluted}
					servings={servings}
					convertUnits={convertUnits}
				/>
			) : null}

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
