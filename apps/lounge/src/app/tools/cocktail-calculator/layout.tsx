import { BottomRailHost } from "@bespoke/ui/BottomRail";
import type { PropsWithChildren } from "react";
import styles from "./layout.module.css";

export default function CocktailCalculatorLayout({
	children,
}: Readonly<PropsWithChildren>) {
	return (
		<div className={styles.container}>
			<BottomRailHost>{children}</BottomRailHost>
		</div>
	);
}
