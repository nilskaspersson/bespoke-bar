import clsx from "clsx";
import Link from "next/link";
import { type ComponentProps, use } from "react";
import type { Ingredient } from "@/db/schema/ingredients";
import { Abv } from "@/features/ingredients/components/Abv";
import { IngredientActions } from "@/features/ingredients/components/IngredientActions";
import { CATEGORY_TO_LABEL } from "@/features/ingredients/constants";
import { useFormatIngredientUnitCost } from "@/features/ingredients/hooks/useFormatIngredientUnitCost";
import { getIngredientUrl } from "@/features/ingredients/utils";
import { FormatterContext } from "@/hooks/useFormatter";
import { Chip } from "@/ui/Chip";
import { Flex } from "@/ui/Flex";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { HGroup } from "@/ui/HGroup";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

export function IngredientCard({
	ingredient,
	withActions,
	className,
	...props
}: ComponentProps<"div"> & {
	ingredient: Partial<Ingredient>;
	withActions?: boolean;
}) {
	const { percentageFormatter } = use(FormatterContext);
	const formatIngredientUnitCost = useFormatIngredientUnitCost();

	return (
		<div className={clsx(styles.card, className)} {...props}>
			<Grid gap={4} className={styles.content}>
				<Grid gap={2}>
					<HGroup overline="Ingredient">
						<Heading level="h3" serif size={6}>
							<Link href={getIngredientUrl(ingredient)} prefetch={false}>
								{ingredient.name}
							</Link>
						</Heading>
					</HGroup>

					{ingredient.description ? (
						<Text as="p" light size={2}>
							{ingredient.description}
						</Text>
					) : null}
				</Grid>

				<Flex gap={2} wrap className={styles.badges}>
					{ingredient.category ? (
						<Chip size={1} color="light">
							{CATEGORY_TO_LABEL.get(ingredient.category)}
						</Chip>
					) : null}

					{ingredient.abv != null ? (
						<Chip size={1} color="light">
							<Abv /> {percentageFormatter.format(ingredient.abv)}
						</Chip>
					) : null}

					{ingredient.brand ? (
						<Chip size={1} color="light">
							{ingredient.brand}
						</Chip>
					) : null}

					{ingredient.unitCost != null ? (
						<Chip size={1} color="light">
							{formatIngredientUnitCost(
								ingredient.unitCost,
								ingredient.measurementType,
							)}
						</Chip>
					) : null}
				</Flex>
			</Grid>

			{withActions ? (
				<IngredientActions
					ingredient={ingredient}
					withLink
					className={styles.actions}
				/>
			) : null}
		</div>
	);
}
