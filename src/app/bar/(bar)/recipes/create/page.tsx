import { LinkButton } from "@/ui/Button";
import { Chip } from "@/ui/Chip";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import { Text } from "@/ui/Text";
import styles from "./page.module.css";

export default function CreateRecipePage() {
	return (
		<Grid gap={6}>
			<Text as="p">Choose a method to create your Recipe.</Text>

			<nav className={styles.nav}>
				<div className={styles.card}>
					<Icon name="duotone-table-tree" size={6} className={styles.icon} />

					<div className={styles.text}>
						<Heading level="h3" size={4} className={styles.label}>
							Structured
						</Heading>

						<Text size={2} as="p">
							Create a Recipe with a structured form.
						</Text>
					</div>

					<LinkButton
						href="/bar/recipes/create/structured"
						size="small"
						variant="solid"
						color="accent"
						className={styles.link}
					>
						Create Recipe
						<Icon name="arrow-right" size={1} />
					</LinkButton>
				</div>

				<div className={styles.card}>
					<Icon name="duotone-input-text" size={6} className={styles.icon} />

					<div className={styles.text}>
						<Heading level="h3" size={4} className={styles.label}>
							Text
						</Heading>

						<Text size={2} as="p">
							Convert text to Recipes and Ingredients.
						</Text>
					</div>

					<LinkButton
						href="/bar/recipes/create/text"
						size="small"
						variant="solid"
						color="accent"
						className={styles.link}
					>
						Create Recipe
						<Icon name="arrow-right" size={1} />
					</LinkButton>
				</div>

				<div className={styles.card} inert>
					<Icon name="duotone-image" size={6} className={styles.icon} />

					<div className={styles.text}>
						<Heading level="h3" size={4} className={styles.label}>
							Photo
						</Heading>

						<Text size={2} as="p">
							Take a photo of a recipe to import it.
						</Text>
					</div>

					<LinkButton
						href="/bar/recipes/create/photo"
						size="small"
						variant="outline"
						color="accent"
						className={styles.link}
						prefetch={false}
						aria-disabled="true"
					>
						Create Recipe
						<Icon name="arrow-right" size={1} />
					</LinkButton>

					<Chip size={1} color="amber" className={styles.soon}>
						Coming soon
					</Chip>
				</div>
			</nav>
		</Grid>
	);
}
