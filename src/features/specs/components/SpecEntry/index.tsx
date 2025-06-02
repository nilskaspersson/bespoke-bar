import clsx from "clsx";
import type { HTMLAttributes } from "react";
import type { Spec } from "@/db/schema/specs";
import { IngredientPicker } from "@/features/ingredients/components/IngredientPicker";
import { QuantityPicker } from "@/features/quantity/components/QuantityPicker";
import styles from "./styles.module.css";

export function SpecEntry({
	className,
	onChange,
	spec,
	...props
}: {
	spec: Partial<Spec>;
	onChange: (spec: Partial<Spec>) => void;
} & Omit<HTMLAttributes<HTMLDivElement>, "onChange">) {
	return (
		<div className={clsx(styles.entry, className)} {...props}>
			<QuantityPicker
				quantity={spec.quantity}
				onChange={(quantity) => onChange({ ...spec, quantity })}
			/>

			{spec.unit != null ? <span>{spec.unit}</span> : null}

			<IngredientPicker
				ingredient={spec.ingredient}
				onChange={(ingredient) => onChange({ ...spec, ingredient })}
			/>
		</div>
	);
}
