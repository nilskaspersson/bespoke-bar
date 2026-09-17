"use client";

import type { BaseRecipe } from "@bespoke/schema/schema/recipes";
import { Checkbox } from "@bespoke/ui/Checkbox";
import { ControlLabel } from "@bespoke/ui/ControlLabel";
import { Flex } from "@bespoke/ui/Flex";
import { Grid } from "@bespoke/ui/Grid";
import {
	useHydrateRecipeAdjustments,
	useRawAdjustments,
} from "@bespoke/ui/RecipeAdjustments";
import { RecipeCard } from "@bespoke/ui/RecipeCard";
import { SelectServings } from "@bespoke/ui/SelectServings";
import { SelectUnitConversion } from "@bespoke/ui/SelectUnitConversion";
import {
	usePersistenceInfo,
	WithPersistenceInfo,
} from "@bespoke/ui/WithPersistenceInfo";
import { useId } from "react";
import styles from "./styles.module.css";

const COMMON_SERVINGS = [1, 2, 4, 6, 12];

export function HeroRecipeCard({ recipe }: { recipe: BaseRecipe }) {
	useHydrateRecipeAdjustments();

	return (
		<Flex direction="column" alignItems="center" gap={4}>
			<AdjustedRecipeCard recipe={recipe} />
			<HeroAdjustments />
		</Flex>
	);
}

function AdjustedRecipeCard({ recipe }: { recipe: BaseRecipe }) {
	const { servings, conversionSystem, withRounding, withBestUnit } =
		useRawAdjustments();

	return (
		<RecipeCard
			className={styles.card}
			isPublic
			withLink={false}
			recipe={recipe}
			servings={servings}
			convertUnits={conversionSystem}
			withRounding={withRounding}
			withBestUnit={withBestUnit}
		/>
	);
}

function HeroAdjustments() {
	const adjustmentsId = useId();

	const {
		servings,
		conversionSystem,
		withRounding,
		withBestUnit,
		setServings,
		setConversionSystem,
		setWithRounding,
		setWithBestUnit,
	} = useRawAdjustments();

	const roundingPersistence = usePersistenceInfo();
	const bestUnitPersistence = usePersistenceInfo();

	return (
		<div className={styles.controls}>
			<SelectServings
				value={servings}
				onChange={setServings}
				commonValues={COMMON_SERVINGS}
			/>

			<Grid gap={4} justifyItems="start">
				<ControlLabel label="Conversions" htmlFor={adjustmentsId}>
					<SelectUnitConversion
						name="heroConversionSystem"
						defaultValue={conversionSystem}
						onChange={setConversionSystem}
						id={adjustmentsId}
					/>
				</ControlLabel>

				<Grid gap={2}>
					<WithPersistenceInfo
						persistent="session"
						persistence={roundingPersistence}
					>
						<Checkbox
							label="With rounding"
							size="small"
							checked={withRounding}
							onChange={(e) => {
								setWithRounding(e.target.checked);
								roundingPersistence.notify();
							}}
						/>
					</WithPersistenceInfo>

					<WithPersistenceInfo
						persistent="session"
						persistence={bestUnitPersistence}
					>
						<Checkbox
							label="Convert to best unit"
							size="small"
							checked={withBestUnit}
							onChange={(e) => {
								setWithBestUnit(e.target.checked);
								bestUnitPersistence.notify();
							}}
						/>
					</WithPersistenceInfo>
				</Grid>
			</Grid>
		</div>
	);
}
