import type { ComponentProps } from "react";
import type { DraftSpecWithDraftIngredient } from "@/db/schema/specs";
import { SpecEntry } from "@/features/specs/components/SpecEntry";
import type { UnitSystems } from "@/features/units/utils/convert";
import { Grid } from "@/ui/Grid";
import { getKey, type Keyed } from "@/utils/withKey";
import styles from "./styles.module.css";

export function SpecsList<T extends DraftSpecWithDraftIngredient>({
	specs,
	servings,
	convertUnits,
	...props
}: {
	specs: Keyed<T>[];
	servings?: number;
	convertUnits?: UnitSystems | null;
} & Omit<ComponentProps<"div">, "children">) {
	return (
		<div {...props}>
			<Grid as="ul" gap={2} className={styles.list}>
				{specs.map((spec) => (
					<li key={getKey(spec)}>
						<SpecEntry
							spec={spec}
							servings={servings}
							convertUnits={convertUnits}
						/>
					</li>
				))}
			</Grid>
		</div>
	);
}
