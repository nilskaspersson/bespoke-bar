import type { BaseRecipe } from "@bespoke/schema/schema/recipes";
import { Chip } from "@bespoke/ui/Chip";
import { Container } from "@bespoke/ui/Container";
import { Grid } from "@bespoke/ui/Grid";
import { Heading } from "@bespoke/ui/Heading";
import { Icon } from "@bespoke/ui/Icon";
import { Text } from "@bespoke/ui/Text";
import { DraftRecipeCard } from "@/features/landing-page/components/DraftRecipeCard";
import styles from "./styles.module.css";

export function PhotoToRecipeSection({ recipe }: { recipe: BaseRecipe }) {
	return (
		<section className={styles.band}>
			<Container className={styles.inner}>
				<Grid as="header" gap={2} className={styles.header}>
					<Heading level="h2" size={7}>
						Start with what you already have.
					</Heading>

					<Text as="p" size={3} balance>
						Paste specs from your notes and each one becomes a recipe. Or
						photograph a printed menu, a notebook page, or the chalkboard at
						that bar you liked, and Bespoke Bar reads it into a draft ready to
						review.
					</Text>

					<Text as="p" size={1} light>
						Three photo imports a month on the free plan. Fifty on Pro.
					</Text>
				</Grid>

				<div className={styles.figure}>
					<div className={styles.photo}>
						<Chip color="amber" size={1} className={styles.placeholder}>
							Placeholder
						</Chip>

						<Icon name="camera" size={6} className={styles.cameraIcon} />

						<div className={styles.menu}>
							<Text as="p" serif size={5} weight={600} compact>
								Penicillin
							</Text>

							<Text as="p" serif size={2} compact>
								Blended Scotch, lemon, honey and ginger, a float of Islay malt
							</Text>

							<Text as="p" serif size={2} compact light>
								14
							</Text>
						</div>

						<Text as="p" size={0} light className={styles.caption}>
							A photographed menu goes here.
						</Text>
					</div>

					<Icon
						name="arrow-right"
						size={6}
						className={styles.arrow}
						aria-hidden="true"
					/>

					<DraftRecipeCard recipe={recipe} className={styles.card} />
				</div>
			</Container>
		</section>
	);
}
