import {
	getClassicCocktail,
	getClassicCocktails,
} from "@bespoke/domain/registry/classicCocktails";
import { LinkButton } from "@bespoke/ui/Button";
import { Chip } from "@bespoke/ui/Chip";
import { Container } from "@bespoke/ui/Container";
import { Flex } from "@bespoke/ui/Flex";
import { Grid } from "@bespoke/ui/Grid";
import { Heading } from "@bespoke/ui/Heading";
import { Icon } from "@bespoke/ui/Icon";
import { Text } from "@bespoke/ui/Text";
import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { HeroRecipeCard } from "@/features/landing-page/components/HeroRecipeCard";
import { HeroRecipeWall } from "@/features/landing-page/components/HeroRecipeWall";
import { LandingPageHero } from "@/features/landing-page/components/LandingPageHero";
import { PhotoToRecipeSection } from "@/features/landing-page/components/PhotoToRecipeSection";
import styles from "./page.module.css";

const BAR_URL = process.env.NEXT_PUBLIC_BAR_URL ?? "";

const FEATURED_RECIPE = "Penicillin";

const WALL_RECIPES = [
	"Negroni",
	"Old Fashioned",
	"Margarita",
	"Boulevardier",
	"Manhattan",
	"Whiskey Sour",
	"Dry Martini",
	"Bijou",
	"Aviation",
	"Moscow Mule",
	"Spritz",
	"Cosmopolitan",
	"Clover Club",
	"Mai-Tai",
	"Sazerac",
	"French 75",
	"Paloma",
	"Piña Colada",
	"Gin Fizz",
	"Espresso Martini",
	"Sidecar",
	"Last Word",
];

export const metadata: Metadata = {
	title: { absolute: "Bespoke Bar :: An archive for your cocktail recipes" },
};

export default async function LandingPage() {
	"use cache";
	cacheLife("max");

	const heroRecipe = getClassicCocktail(FEATURED_RECIPE);
	const wallRecipes = getClassicCocktails(WALL_RECIPES);

	return (
		<>
			<LandingPageHero
				aside={<HeroRecipeCard recipe={heroRecipe} />}
				backdrop={<HeroRecipeWall recipes={wallRecipes} />}
			>
				<Container as="section" className={styles.sheet}>
					<Flex gap={5} justifyContent="space-between" alignItems="center" wrap>
						<Grid gap={2}>
							<Heading level="h2">Hello!</Heading>

							<Text as="p" size={4} balance className={styles.subhead}>
								Bespoke Bar has <strong>tools for your cocktail recipes</strong>
								.
								<br />
								Curate, calculate, and collaborate on recipes and menus.
							</Text>
						</Grid>

						<Grid gap={4} justifyItems="end">
							<span className={styles.primary}>
								<LinkButton
									href={`${BAR_URL}/recipes`}
									variant="solid"
									color="heavy"
									size="large"
								>
									Start your archive <Icon name="arrow-right" size={5} />
								</LinkButton>

								<Chip color="accent" className={styles.chip}>
									It's free
								</Chip>
							</span>

							<LinkButton
								href="/tools/cocktail-calculator"
								variant="ghost"
								color="accent"
								size="small"
							>
								Try the calculator
								<Icon name="angles-right" size={2} />
							</LinkButton>
						</Grid>
					</Flex>
				</Container>
			</LandingPageHero>

			<PhotoToRecipeSection />
		</>
	);
}
