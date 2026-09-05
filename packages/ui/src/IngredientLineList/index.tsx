import type { UnitSystems } from "@bespoke/domain/units/convert";
import { getKey } from "@bespoke/domain/utils/withKey";
import type { DraftIngredientLineWithDraftIngredient } from "@bespoke/schema/schema/ingredientLines";
import type { Keyed } from "@bespoke/schema/types";
import type { ComponentProps } from "react";
import { Grid } from "../Grid";
import { IngredientLineEntry } from "../IngredientLineEntry";
import styles from "./styles.module.css";

export function IngredientLineList<
	T extends DraftIngredientLineWithDraftIngredient,
>({
	lines,
	servings,
	convertUnits,
	withRounding,
	withBestUnit,
	animateNumbers,
	...props
}: {
	lines: Keyed<T>[];
	servings?: number;
	convertUnits?: UnitSystems | null;
	withRounding?: boolean;
	withBestUnit?: boolean;
	animateNumbers?: boolean;
} & Omit<ComponentProps<"div">, "children">) {
	return (
		<div {...props}>
			<Grid as="ul" gap={2} className={styles.list}>
				{lines.map((line) => (
					<li key={getKey(line)} className={styles.item}>
						<IngredientLineEntry
							className={styles.entry}
							line={line}
							servings={servings}
							convertUnits={convertUnits}
							withRounding={withRounding}
							withBestUnit={withBestUnit}
							animateNumbers={animateNumbers}
						/>
					</li>
				))}
			</Grid>
		</div>
	);
}
