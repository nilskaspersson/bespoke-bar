"use client";

import { clsx } from "clsx";
import type { DraftSpecWithDraftIngredient } from "@/db/schema/specs";
import { ToggleIngredientCard } from "@/features/ingredients/components/ToggleIngredientCard";
import { useFormatSpecMeasure } from "@/features/specs/hooks/useFormatSpecMeasure";
import { useSpecQuantityFormatter } from "@/features/specs/hooks/useSpecQuantityFormatter";
import type { UnitSystems } from "@/features/units/utils/convert";
import { AnimatedNumber } from "@/ui/AnimatedNumber";
import { Chip } from "@/ui/Chip";
import { Text, type TextProps } from "@/ui/Text";
import styles from "./styles.module.css";

export function SpecEntry<T extends DraftSpecWithDraftIngredient>({
	className,
	convertUnits,
	withRounding,
	withBestUnit,
	onChange,
	spec,
	servings = 1,
	animateNumbers = true,
	...props
}: {
	spec: T;
	onChange?: (spec: T) => void;
	convertUnits?: UnitSystems | null;
	withRounding?: boolean;
	withBestUnit?: boolean;
	servings?: number;
	animateNumbers?: boolean;
} & Omit<TextProps, "onChange">) {
	const isDraftIngredient = !spec.ingredientId;
	const formatSpecMeasure = useFormatSpecMeasure();
	const formatQuantity = useSpecQuantityFormatter();

	const measure = formatSpecMeasure({
		spec,
		servings,
		convertUnits,
		withRounding,
		withBestUnit,
	});

	return (
		<Text
			as="div"
			compact
			serif
			className={clsx(styles.entry, className)}
			{...props}
		>
			<span className={styles.node}>
				{spec.quantity && servings != null ? (
					<>
						{animateNumbers ? (
							<AnimatedNumber
								value={measure.quantity}
								format={formatQuantity}
							/>
						) : (
							formatQuantity(measure.quantity)
						)}{" "}
						{measure.unit}
					</>
				) : (
					measure.formatted
				)}
			</span>

			{
				/**
				 * This space is used to create better formatting if users select and copy
				 */ " "
			}

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
