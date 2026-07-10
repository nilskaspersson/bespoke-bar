import {
	type CocktailStyleFilter,
	getCocktailStyleLabel,
} from "@bespoke/domain/recipes/labels";
import { Button } from "@bespoke/ui/Button";
import { clsx } from "clsx";
import type { CSSProperties } from "react";
import { getCocktailStyleColor } from "@/features/recipes/constants";
import styles from "./styles.module.css";

type Props = {
	style: CocktailStyleFilter;
	count?: number;
	variant?: "outline" | "legend";
	selected?: boolean;
	dim?: boolean;
	onClick?: () => void;
	className?: string;
};

export function CocktailStyleChip({
	style,
	count,
	variant = "outline",
	selected = false,
	dim = false,
	onClick,
	className,
}: Props) {
	const color = getCocktailStyleColor(style);
	const label = getCocktailStyleLabel(style);
	const colorVar = { "--style-color": color } as CSSProperties;

	const baseClass = clsx(
		styles.chip,
		variant === "legend" ? styles.legend : styles.outline,
		{
			[styles.selected]: selected,
			[styles.dim]: dim,
		},
		className,
	);

	const content = (
		<>
			<span className={styles.dot} aria-hidden />
			{label}
			{count !== undefined ? (
				<span className={styles.count}>{count}</span>
			) : null}
		</>
	);

	if (onClick) {
		return (
			<Button
				variant="base"
				onClick={onClick}
				aria-pressed={selected}
				className={clsx(baseClass, styles.interactive)}
				style={colorVar}
			>
				{content}
			</Button>
		);
	}

	return (
		<span className={baseClass} style={colorVar}>
			{content}
		</span>
	);
}
