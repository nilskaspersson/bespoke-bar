"use client";

import type { UnitSystems } from "@bespoke/domain/units/convert";
import type { DraftIngredientLineWithDraftIngredient } from "@bespoke/schema/schema/ingredientLines";
import { clsx } from "clsx";
import { useFormatLineMeasure } from "@/features/ingredientLines/hooks/useFormatLineMeasure";
import { useLineQuantityFormatter } from "@/features/ingredientLines/hooks/useLineQuantityFormatter";
import { ToggleIngredientCard } from "@/features/ingredients/components/ToggleIngredientCard";
import { AnimatedNumber } from "@/ui/AnimatedNumber";
import { Chip } from "@/ui/Chip";
import { Text, type TextProps } from "@/ui/Text";
import styles from "./styles.module.css";

export function IngredientLineEntry<
	T extends DraftIngredientLineWithDraftIngredient,
>({
	className,
	convertUnits,
	withRounding,
	withBestUnit,
	onChange,
	line,
	servings = 1,
	animateNumbers = true,
	...props
}: {
	line: T;
	onChange?: (line: T) => void;
	convertUnits?: UnitSystems | null;
	withRounding?: boolean;
	withBestUnit?: boolean;
	servings?: number;
	animateNumbers?: boolean;
} & Omit<TextProps, "onChange">) {
	const isDraftIngredient = !line.ingredientId;
	const formatLineMeasure = useFormatLineMeasure();
	const formatQuantity = useLineQuantityFormatter();

	const measure = formatLineMeasure({
		line,
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
				{line.quantity && servings != null ? (
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

			{isDraftIngredient && line.ingredient.name ? (
				<>
					<span className={clsx(styles.node, styles.label, styles.isNew)}>
						{line.ingredient.name}

						<OptionalText optional={line.optional} />
					</span>

					<Chip size={0} className={clsx(styles.node, styles.badge)}>
						New
					</Chip>
				</>
			) : (
				<span className={clsx(styles.node, styles.label)}>
					<ToggleIngredientCard
						ingredient={line.ingredient}
						className={styles.toggle}
					/>

					<OptionalText optional={line.optional} />
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
