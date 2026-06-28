import { toCSSVars } from "@bespoke/ui/utils/styles";
import { clsx } from "clsx";
import type { CocktailStyleEntry } from "@/features/recipes/utils/cocktailStyleEntries";
import styles from "./styles.module.css";

export function CocktailStyleBar({
	items,
	className,
}: {
	items: CocktailStyleEntry[];
	className?: string;
}) {
	if (items.length === 0) {
		return null;
	}

	return (
		<div className={clsx(styles.bar, className)}>
			{items.map((item) => (
				<span
					key={item.label}
					className={styles.segment}
					style={toCSSVars({ jsxEntryColor: item.color, jsxCount: item.count })}
					title={`${item.label}: ${item.count}`}
				>
					<span className="sr-only">
						{item.label}: {item.count}
					</span>
				</span>
			))}
		</div>
	);
}
