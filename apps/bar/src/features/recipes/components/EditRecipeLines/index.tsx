"use client";

import type { RecipeFormData } from "@bespoke/schema/schema/composite";
import type { Ingredient } from "@bespoke/schema/schema/ingredients";
import { Button } from "@bespoke/ui/Button";
import { Callout } from "@bespoke/ui/Callout";
import { Grid } from "@bespoke/ui/Grid";
import { Icon } from "@bespoke/ui/Icon";
import { Text } from "@bespoke/ui/Text";
import { type FieldName, useField } from "@conform-to/react";
import { clsx } from "clsx";
import type { ComponentProps } from "react";
import { EditRecipeLineItem } from "./EditRecipeLineItem";
import styles from "./styles.module.css";

type IngredientLine = NonNullable<RecipeFormData["lines"]>;

const EMPTY_LINE = {
	quantity: "1",
	unit: "cl",
	ingredientId: undefined,
	optional: false,
	ingredient: {
		name: "",
		description: "",
		abv: undefined,
		brand: "",
		category: "",
		measurementType: "volume",
		unitCost: "",
	},
};

export function EditRecipeLines({
	className,
	ingredients,
	name,
	withOptional,
	...props
}: {
	ingredients: Ingredient[];
	name: FieldName<IngredientLine, RecipeFormData>;
	withOptional: boolean;
} & ComponentProps<"fieldset">) {
	const [fields, form] = useField(name);
	const lines = fields.getFieldList();

	const handleRemove = (index: number) => {
		if (lines.length <= 1) {
			form.update({ name: fields.name, value: [EMPTY_LINE] });
		} else {
			form.remove({ name: fields.name, index });
		}
	};

	return (
		<Grid
			as="fieldset"
			gap={4}
			className={clsx(className, styles.fieldset)}
			{...props}
		>
			<Grid gap={2}>
				<Grid as="ul" gap={2}>
					{lines.map((field, index) => (
						<EditRecipeLineItem
							key={field.key}
							name={field.name}
							actions={
								<Button
									variant="ghost"
									color="red"
									size="small"
									icon
									type="button"
									aria-label="Remove line"
									title="Remove line"
									className={styles.remove}
									onClick={() => {
										handleRemove(index);
									}}
								>
									<Icon name="xmark" size={3} />
								</Button>
							}
							ingredients={ingredients}
							withOptional={withOptional}
						/>
					))}
				</Grid>

				<div className={clsx(styles.card, styles.add)}>
					{/**
					 * `type="button"` (not `type="submit"`) so it can't become the form's
					 * implicit-submission target on Enter. The save button lives outside
					 * the form (portaled to the BottomRail) and is reached via click or
					 * the BottomRail's `mod+Enter` shortcut — there are no submit
					 * descendants in the form, so plain Enter does nothing.
					 */}
					<Button
						type="button"
						variant="clear"
						color="light"
						rounded
						fullWidth
						onClick={() => {
							form.insert({ name: fields.name, defaultValue: EMPTY_LINE });
						}}
					>
						Add additional line
					</Button>
				</div>
			</Grid>

			<Callout size={1} variant="inset" color="accent" icon="circle-info">
				Create new <Text as="dfn">Ingredients</Text> on the fly by typing a
				name.
			</Callout>
		</Grid>
	);
}
