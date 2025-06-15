import { clsx } from "clsx";
import Link from "next/link";
import type { HTMLAttributes } from "react";
import type { DraftSpecWithDraftIngredient } from "@/db/schema/specs";
import { QuantityPicker } from "@/features/quantity/components/QuantityPicker";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

export function SpecEntry<T extends DraftSpecWithDraftIngredient>({
	className,
	onChange,
	spec,
	...props
}: {
	spec: T;
	onChange?: (spec: T) => void;
} & Omit<HTMLAttributes<HTMLDivElement>, "onChange">) {
	return (
		<Text as="div" className={clsx(styles.entry, className)} {...props}>
			<QuantityPicker
				quantity={spec.quantity}
				onChange={(quantity) => onChange?.({ ...spec, quantity })}
			/>

			{spec.unit != null ? <span>{spec.unit}</span> : null}

			{spec.ingredient.createdAt != null ? (
				<Link href={`/bar/ingredients/${spec.ingredient.id}`}>
					{spec.ingredient.name}
				</Link>
			) : (
				<span>{spec.ingredient.name}</span>
			)}
		</Text>
	);
}
