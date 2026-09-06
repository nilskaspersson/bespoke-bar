import { Container } from "@bespoke/ui/Container";
import { PageHeader } from "@bespoke/ui/PageHeader";
import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { CocktailCalculator } from "@/features/cocktail-calculator/components/CocktailCalculator";
import styles from "./page.module.css";

export const metadata: Metadata = {
	title: "Cocktail calculator",
	description:
		"Write cocktail recipes as plain text and get scalable, unit-convertible cards back. Free, no account needed.",
};

export default async function CocktailCalculatorPage() {
	"use cache";
	cacheLife("max");

	return (
		<Container as="article" className={styles.page}>
			<PageHeader
				overline="Tools"
				icon="wrench"
				heading="Cocktail calculator"
				tagline="Type or paste your recipes. Separate recipes with a blank line. Scale servings, convert between metric and imperial, and read back totals."
			/>

			<CocktailCalculator />
		</Container>
	);
}
