import { Container } from "@bespoke/ui/Container";
import { Grid } from "@bespoke/ui/Grid";
import { Heading } from "@bespoke/ui/Heading";
import { Text } from "@bespoke/ui/Text";
import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { RecipeCalculator } from "@/features/recipe-calculator/components/RecipeCalculator";
import styles from "./page.module.css";

export const metadata: Metadata = {
	title: "Recipe calculator",
	description:
		"Write cocktail recipes as plain text and get scalable, unit-convertible cards back. Free, no account needed.",
};

export default async function RecipeCalculatorPage() {
	"use cache";
	cacheLife("max");

	return (
		<Container as="section" className={styles.page}>
			<Grid as="header" gap={2} className={styles.header}>
				<Heading level="h1" size={8}>
					Recipe calculator
				</Heading>

				<Text as="p" balance>
					Type or paste your recipes — one per block, separated by a blank line.
					Scale the servings, switch between metric and imperial, and read the
					measures back.
				</Text>
			</Grid>

			<RecipeCalculator />
		</Container>
	);
}
