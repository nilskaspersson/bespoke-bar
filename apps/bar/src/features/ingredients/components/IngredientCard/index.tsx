import type { Ingredient } from "@bespoke/schema/schema/ingredients";
import { Chip } from "@bespoke/ui/Chip";
import { Flex } from "@bespoke/ui/Flex";
import { Grid } from "@bespoke/ui/Grid";
import { Heading } from "@bespoke/ui/Heading";
import { HGroup } from "@bespoke/ui/HGroup";
import { FormatterContext } from "@bespoke/ui/hooks/useFormatter";
import { Text } from "@bespoke/ui/Text";
import clsx from "clsx";
import Link from "next/link";
import { type ComponentProps, use } from "react";
import { EnrichmentMark } from "@/components/EnrichmentMark";
import { Abv } from "@/features/ingredients/components/Abv";
import { IngredientActions } from "@/features/ingredients/components/IngredientActions";
import { CATEGORY_TO_LABEL } from "@/features/ingredients/constants";
import { useFormatIngredientUnitCost } from "@/features/ingredients/hooks/useFormatIngredientUnitCost";
import { getIngredientUrl } from "@/features/ingredients/utils";
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

	const enrichedFields = new Set(ingredient.aiEnrichedFields ?? []);

	return (
		<div className={clsx(styles.card, className)} {...props}>
			<Grid gap={4} className={styles.content}>
				<Grid gap={2}>
					<HGroup overline="Ingredient" floatingOverline>
						<Heading level="h3" serif size={6}>
							<Link href={getIngredientUrl(ingredient)} prefetch={false}>
								{ingredient.name}
							</Link>
						</Heading>
					</HGroup>

					{ingredient.description ? (
						<Flex gap={2} alignItems="baseline">
							{enrichedFields.has("description") ? <EnrichmentMark /> : null}

							<Text as="p" light size={2}>
								{ingredient.description}
							</Text>
						</Flex>
					) : null}
				</Grid>

				<Flex gap={2} wrap className={styles.badges}>
					{ingredient.category ? (
						<Chip
							size={1}
							color="light"
							icon={
								enrichedFields.has("category") ? <EnrichmentMark /> : undefined
							}
						>
							{CATEGORY_TO_LABEL.get(ingredient.category)}
						</Chip>
					) : null}

					{ingredient.abv != null ? (
						<Chip
							size={1}
							color="light"
							icon={enrichedFields.has("abv") ? <EnrichmentMark /> : undefined}
						>
							<Abv /> {percentageFormatter.format(ingredient.abv)}
						</Chip>
					) : null}

					{ingredient.brand ? (
						<Chip
							size={1}
							color="light"
							icon={
								enrichedFields.has("brand") ? <EnrichmentMark /> : undefined
							}
						>
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
