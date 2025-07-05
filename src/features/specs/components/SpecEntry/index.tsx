import { clsx } from "clsx";
import Link from "next/link";
import type { ComponentProps } from "react";
import type { DraftSpecWithDraftIngredient } from "@/db/schema/specs";
import type { UnitSystems } from "@/features/units/utils/convert";
import { quantityToBestUnit } from "@/features/units/utils/formatVolume";
import { getFormattedUnit } from "@/features/units/utils/getFormattedUnit";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

export function SpecEntry<T extends DraftSpecWithDraftIngredient>({
	className,
	convertUnits,
	onChange,
	spec,
	servings = 1,
	...props
}: {
	spec: T;
	onChange?: (spec: T) => void;
	convertUnits?: UnitSystems | null;
	servings?: number;
} & Omit<ComponentProps<typeof Text>, "onChange">) {
	const isDraftIngredient = !spec.ingredientId;

	return (
		<Text as="div" compact className={clsx(styles.entry, className)} {...props}>
			{spec.quantity != null || spec.unit != null ? (
				<span className={styles.node}>
					{convertUnits
						? quantityToBestUnit({
								quantity: spec.quantity,
								unit: spec.unit,
								unitSystem: convertUnits,
								servings,
							})
						: `${spec.quantity ? spec.quantity * servings : ""} ${getFormattedUnit(spec.unit, spec.quantity)}`}
				</span>
			) : null}

			{isDraftIngredient ? (
				<>
					<span className={clsx(styles.node, styles.name)}>
						{spec.ingredient.name}
					</span>
					<span className={clsx(styles.node, styles.new)}>New</span>
				</>
			) : (
				<Link
					href={`/bar/ingredients/${spec.ingredient.id}`}
					className={clsx(styles.node, styles.name)}
				>
					{spec.ingredient.name}
				</Link>
			)}
		</Text>
	);
}
