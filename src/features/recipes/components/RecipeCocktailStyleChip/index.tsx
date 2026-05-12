import { clsx } from "clsx";
import type { CSSProperties } from "react";
import {
	type CocktailStyleFilter,
	getCocktailStyleColor,
	getCocktailStyleLabel,
} from "@/features/recipes/constants";
import styles from "./styles.module.css";

type Props = {
	style: CocktailStyleFilter;
	selected?: boolean;
	onClick?: () => void;
	className?: string;
};

export function RecipeCocktailStyleChip({
	style,
	selected = false,
	onClick,
	className,
}: Props) {
	const color = getCocktailStyleColor(style);
	const label = getCocktailStyleLabel(style);
	const colorVar = { "--style-color": color } as CSSProperties;

	if (onClick) {
		return (
			<button
				type="button"
				onClick={onClick}
				aria-pressed={selected}
				className={clsx(
					styles.chip,
					styles.interactive,
					{ [styles.selected]: selected },
					className,
				)}
				style={colorVar}
			>
				<span className={styles.dot} aria-hidden />
				{label}
			</button>
		);
	}

	return (
		<span className={clsx(styles.chip, className)} style={colorVar}>
			<span className={styles.dot} aria-hidden />
			{label}
		</span>
	);
}
