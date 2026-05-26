"use client";

import { type FieldName, useField } from "@conform-to/react";
import { clsx } from "clsx";
import type { ComponentProps } from "react";
import type { RecipeFormData } from "@/db/schema/composite";
import type { Ingredient } from "@/db/schema/ingredients";
import { Button } from "@/ui/Button";
import { Callout } from "@/ui/Callout";
import { Grid } from "@/ui/Grid";
import { Icon } from "@/ui/Icon";
import { Text } from "@/ui/Text";
import { EditRecipeSpecItem } from "./EditRecipeSpecItem";
import styles from "./styles.module.css";

type Spec = NonNullable<RecipeFormData["specs"]>;

const EMPTY_SPEC = {
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

export function EditRecipeSpecs({
	className,
	ingredients,
	name,
	withOptional,
	...props
}: {
	ingredients: Ingredient[];
	name: FieldName<Spec, RecipeFormData>;
	withOptional: boolean;
} & ComponentProps<"fieldset">) {
	const [fields, form] = useField(name);
	const specs = fields.getFieldList();

	const handleRemove = (index: number) => {
		if (specs.length <= 1) {
			form.update({ name: fields.name, value: [EMPTY_SPEC] });
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
					{specs.map((field, index) => (
						<EditRecipeSpecItem
							key={field.key}
							name={field.name}
							actions={
								<Button
									variant="ghost"
									color="red"
									size="small"
									icon
									type="button"
									aria-label="Remove spec"
									title="Remove spec"
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
							form.insert({ name: fields.name, defaultValue: EMPTY_SPEC });
						}}
					>
						Add additional spec
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
