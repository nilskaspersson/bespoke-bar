"use client";

import {
	type ReactNode,
	useContext,
	useDeferredValue,
	useId,
	useState,
} from "react";
import z from "zod/v4";
import type { BaseRecipe } from "@/db/schema/recipes";
import { RecipeMetrics } from "@/features/recipes/components/RecipeMetrics";
import { RecipeName } from "@/features/recipes/components/RecipeName";
import { SelectUnitConversion } from "@/features/recipes/components/SelectUnitConversion";
import { SpecsList } from "@/features/specs/components/SpecsList";
import type { UnitSystems } from "@/features/units/utils/convert";
import { FormatterContext } from "@/hooks/useFormatter";
import { Button } from "@/ui/Button";
import { ControlLabel } from "@/ui/ControlLabel";
import { Flex } from "@/ui/Flex";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import { Input } from "@/ui/Input";
import { Text } from "@/ui/Text";
import { times } from "@/utils";
import styles from "./styles.module.css";

export function RecipeInfo<T extends BaseRecipe>({
	children,
	recipe,
}: {
	children?: ReactNode;
	recipe: T;
}) {
	const { quantityFormatter } = useContext(FormatterContext);

	const [servings, setServings] = useState(1);
	const deferredServings = useDeferredValue(servings);
	const servingsId = useId();

	const [withConversionSystem, setWithConversionSystem] =
		useState<UnitSystems | null>(null);

	if (!recipe.specs || recipe.specs.length === 0) {
		return null;
	}

	return (
		<div className={styles.base}>
			<section className={styles.primary}>
				<div className={styles.card}>
					<Heading level="h2" size={4} className={styles.heading}>
						<RecipeName recipe={recipe} />
						<Icon name="martini-glass" className={styles.icon} size={3} />
					</Heading>

					<Grid gap={6}>
						<SpecsList
							specs={recipe.specs}
							servings={servings}
							convertUnits={withConversionSystem}
						/>

						{recipe.instructions ? (
							<Text as="p" size={3} serif>
								{recipe.instructions}
							</Text>
						) : null}

						<Text
							as="div"
							size={1}
							align="right"
							fullWidth
							className={styles.count}
						>
							Servings: {quantityFormatter.format(servings)}
						</Text>
					</Grid>
				</div>

				{children}
			</section>

			<aside className={styles.card}>
				<Heading level="h2" size={4} className={styles.heading}>
					Stats & Settings
				</Heading>

				<Grid gap={4}>
					<SelectUnitConversion
						name="withConversionSystem"
						defaultValue={withConversionSystem}
						onChange={setWithConversionSystem}
					/>

					<div className={styles.servings}>
						<ControlLabel label="Servings" htmlFor={servingsId}>
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
										id={servingsId}
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
						</ControlLabel>
					</div>

					<RecipeMetrics
						recipe={recipe}
						servings={deferredServings}
						convertUnits={withConversionSystem}
					/>
				</Grid>
			</aside>
		</div>
	);
}
