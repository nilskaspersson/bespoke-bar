import { useState } from "react";
import z from "zod/v4";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { CostInfo } from "@/features/recipes/components/CostInfo";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { TextField } from "@/ui/TextField";
import { currencySchema } from "@/utils/currencySchema";
import { RecipeEntryProfit } from "../RecipeEntryProfit";

type Props = {
	price: unknown;
	recipe: RecipeWithSpecs;
	className?: string;
};

export function RecipeEntryPriceCalculation({
	price,
	recipe,
	className,
}: Props) {
	const [servings, setServings] = useState(1);
	const parsedPrice = currencySchema.safeParse(price);

	const priceValue = parsedPrice.success ? parsedPrice.data : 0;

	return (
		<Grid gap={4} className={className}>
			<Heading level="h6" size={2}>
				Price calculation
			</Heading>

			<TextField
				inline
				name="servings"
				label="Servings"
				type="number"
				min={1}
				max={1000000000}
				defaultValue={servings}
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

			<Grid as="output" gap={1}>
				<RecipeEntryProfit
					recipe={recipe}
					price={priceValue}
					servings={servings}
				/>

				<CostInfo recipe={recipe} servings={servings} />
			</Grid>
		</Grid>
	);
}
