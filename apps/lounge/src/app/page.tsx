import { LinkButton } from "@bespoke/ui/Button";
import { Container } from "@bespoke/ui/Container";
import { Flex } from "@bespoke/ui/Flex";
import { Grid } from "@bespoke/ui/Grid";
import { Heading } from "@bespoke/ui/Heading";
import { Icon } from "@bespoke/ui/Icon";
import { Text } from "@bespoke/ui/Text";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { LandingPageHero } from "@/features/landing-page/components/LandingPageHero";
import styles from "./page.module.css";

const BAR_URL = process.env.NEXT_PUBLIC_BAR_URL ?? "";

export default async function LandingPage() {
	"use cache";
	cacheLife("max");

	return (
		<LandingPageHero>
			<Container className={styles.content} as="section">
				<Flex gap={2} aria-hidden="true" className={styles.icons}>
					<Icon name="wine-glass" size={5} className={styles.icon} />
					<Icon name="martini-glass" size={5} className={styles.icon} />
					<Icon name="glass-citrus" size={5} className={styles.icon} />
				</Flex>

				<Flex gap={5} justifyContent="space-between" wrap>
					<Grid as="header" gap={4}>
						<Heading level="h2" size={8} className={styles.heading}>
							Hello!
						</Heading>

						<Text as="p" balance>
							Bespoke Bar has <strong>tools for cocktail recipes.</strong>{" "}
							Create, <Link href="/tools/recipe-calculator">calculate</Link>,
							and collaborate on recipes and lists with your team.
						</Text>
					</Grid>

					<div className={styles.actions}>
						<LinkButton
							href={`${BAR_URL}/recipes`}
							variant="outline"
							color="heavy"
						>
							To the bar <Icon name="arrow-right" size={4} />
						</LinkButton>
					</div>
				</Flex>
			</Container>
		</LandingPageHero>
	);
}
