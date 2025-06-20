import { clsx } from "clsx";
import type { GetItemPropsReturnValue } from "downshift";
import type { ComponentProps } from "react";
import { Icon } from "@/ui/Icon";
import styles from "./styles.module.css";

export function OptionItem({
	className,
	children,
	isHighlighted,
	isSelected,
	...props
}: ComponentProps<"li"> &
	GetItemPropsReturnValue & {
		isHighlighted: boolean;
		isSelected: boolean;
	}) {
	return (
		<li
			className={clsx(styles.item, className, {
				[styles.isHighlighted]: isHighlighted,
			})}
			{...props}
		>
			<div className={styles.label}>{children}</div>

			{isSelected ? (
				<div className={styles.icon}>
					<Icon name="check" />
				</div>
			) : null}
		</li>
	);
}
