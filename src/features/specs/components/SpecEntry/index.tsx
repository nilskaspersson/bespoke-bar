import { clsx } from "clsx";
import Link from "next/link";
import type { HTMLAttributes } from "react";
import type { DraftSpecWithDraftIngredient } from "@/db/schema/specs";
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
	const isDraftIngredient = !spec.ingredientId;

	return (
		<Text as="div" compact className={clsx(styles.entry, className)} {...props}>
			{spec.quantity != null ? (
				<span className={styles.node}>{spec.quantity}</span>
			) : null}

			{spec.unit != null ? (
				<span className={styles.node}>{spec.unit}</span>
			) : null}

			{isDraftIngredient ? (
				<>
					<span className={clsx(styles.node, styles.name)}>
						{spec.ingredient.name}
					</span>
					<span className={clsx(styles.node, styles.new)}>New</span>
				</>
			) : (
				<Link
					href={`/bar/ingredients/${spec.ingredient.id}`}
					className={clsx(styles.node, styles.name)}
				>
					{spec.ingredient.name}
				</Link>
			)}
		</Text>
	);
}
