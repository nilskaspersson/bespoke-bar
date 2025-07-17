import { LandingPageHero } from "@/app/components/LandingPageHero";
import { LinkButton } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Flex } from "@/ui/Flex";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import { Text } from "@/ui/Text";
import styles from "./page.module.css";

export default async function LandingPage() {
	return (
		<LandingPageHero className={styles.base}>
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
							Create, calculate, and collaborate on recipes and lists with your
							team.
						</Text>
					</Grid>

					<div className={styles.actions}>
						<LinkButton href="/bar" variant="outline" color="heavy">
							To the bar <Icon name="arrow-right" size={4} />
						</LinkButton>
					</div>
				</Flex>
			</Container>
		</LandingPageHero>
	);
}
