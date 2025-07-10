"use client";

import { type ReactNode, useDeferredValue, useState } from "react";
import z from "zod/v4";
import type { BaseRecipe } from "@/db/schema/recipes";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { RecipeMetrics } from "@/features/recipes/components/RecipeMetrics";
import { SelectUnitConversion } from "@/features/recipes/components/SelectUnitConversion";
import type { UnitSystems } from "@/features/units/utils/convert";
import { Button } from "@/ui/Button";
import { Flex } from "@/ui/Flex";
import { Input } from "@/ui/Input";
import { Text } from "@/ui/Text";
import { times } from "@/utils";
import styles from "./styles.module.css";

export function RecipeInfo<T extends BaseRecipe>({
	recipe,
	header,
	tools,
}: {
	recipe: T;
	header?: ReactNode;
	tools?: ReactNode;
}) {
	const [servings, setServings] = useState(1);
	const deferredServings = useDeferredValue(servings);

	const [withConversionSystem, setWithConversionSystem] =
		useState<UnitSystems | null>(null);

	if (!recipe.specs || recipe.specs.length === 0) {
		return null;
	}

	return (
		<>
			<RecipeCard
				recipe={recipe}
				header={header}
				tools={tools}
				servings={deferredServings}
				withConversionSystem={withConversionSystem}
				className={styles.card}
			/>

			<aside className={styles.aside}>
				<SelectUnitConversion
					name="withConversionSystem"
					defaultValue={withConversionSystem}
					onChange={setWithConversionSystem}
				/>

				<div className={styles.servings}>
					<Text size={2} compact heavy as="div">
						Servings:
					</Text>

					<Flex gap={1} alignItems="center">
						{times(4).map((i) => (
							<Button
								key={i}
								size="tiny"
								icon
								variant={deferredServings === i + 1 ? "solid" : "outline"}
								color={deferredServings === i + 1 ? "heavy" : "light"}
								onClick={() => setServings(i + 1)}
							>
								{i + 1}
							</Button>
						))}

						<div>
							<Input
								name="servings"
								placeholder="5…"
								type="number"
								pill
								min={1}
								max={1000000000}
								onChange={(event) => {
									const parsedValue = z.coerce
										.number()
										.min(1)
										.max(1000000000)
										.safeParse(event.target.value);

									if (parsedValue.success) {
										setServings(parsedValue.data);
									}
								}}
							/>
						</div>
					</Flex>
				</div>

				<RecipeMetrics
					recipe={recipe}
					servings={deferredServings}
					convertUnits={withConversionSystem}
				/>
			</aside>
		</>
	);
}
