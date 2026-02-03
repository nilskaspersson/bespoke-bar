"use client";

import { clsx } from "clsx";
import type { ComponentProps } from "react";
import type { DraftSpecWithDraftIngredient } from "@/db/schema/specs";
import { ToggleIngredientCard } from "@/features/ingredients/components/ToggleIngredientCard";
import { useFormatSpecMeasure } from "@/features/specs/hooks/useFormatSpecMeasure";
import type { UnitSystems } from "@/features/units/utils/convert";
import { Chip } from "@/ui/Chip";
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
	const formatSpecMeasure = useFormatSpecMeasure();

	return (
		<Text
			as="div"
			compact
			serif
			className={clsx(styles.entry, className)}
			{...props}
		>
			<span className={styles.node}>
				{formatSpecMeasure({ spec, servings, convertUnits })}
			</span>

			{isDraftIngredient && spec.ingredient.name ? (
				<>
					<span className={clsx(styles.node, styles.label, styles.isNew)}>
						{spec.ingredient.name}

						<OptionalText optional={spec.optional} />
					</span>

					<Chip size={0} className={clsx(styles.node, styles.badge)}>
						New
					</Chip>
				</>
			) : (
				<span className={clsx(styles.node, styles.label)}>
					<ToggleIngredientCard
						ingredient={spec.ingredient}
						className={styles.toggle}
					/>

					<OptionalText optional={spec.optional} />
				</span>
			)}
		</Text>
	);
}

function OptionalText({ optional }: { optional: boolean | null | undefined }) {
	if (!optional) {
		return null;
	}

	return <span className={clsx(styles.node, styles.optional)}>(optional)</span>;
}
