import { useId, useState } from "react";
import z from "zod";
import type { RecipeWithLines } from "@/db/schema/recipes";
import { CostInfo } from "@/features/recipes/metrics/components/CostInfo";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { TextField } from "@/ui/TextField";
import { currencySchema } from "@/utils/currencySchema";
import { MenuEntryProfit } from "../MenuEntryProfit";

type Props = {
	price: unknown;
	recipe: RecipeWithLines;
	className?: string;
	priceInputId: string;
};

export function MenuEntryPriceCalculation({
	price,
	recipe,
	className,
	priceInputId,
}: Props) {
	const [servings, setServings] = useState(1);
	const parsedPrice = currencySchema.safeParse(price);
	const servingsId = useId();

	const priceValue = parsedPrice.success ? parsedPrice.data : 0;

	return (
		<Grid gap={4} className={className}>
			<Heading level="h6" size={2}>
				Price calculation
			</Heading>

			<TextField
				inline
				id={servingsId}
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

			<Grid as="output" gap={1} htmlFor={`${priceInputId} ${servingsId}`}>
				<MenuEntryProfit
					recipe={recipe}
					price={priceValue}
					servings={servings}
				/>

				<CostInfo recipe={recipe} servings={servings} />
			</Grid>
		</Grid>
	);
}
