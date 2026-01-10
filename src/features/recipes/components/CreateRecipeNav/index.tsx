import { clsx } from "clsx";
import type { ComponentProps } from "react";
import { LinkButton } from "@/ui/Button";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

export function CreateRecipeNav({
	className,
	...props
}: Omit<ComponentProps<"nav">, "children">) {
	return (
		<nav className={clsx(styles.nav, className)} {...props}>
			<ul className={styles.list}>
				<li className={styles.card}>
					<Icon name="duotone-input-text" size={6} className={styles.icon} />

					<div className={styles.text}>
						<Heading level="h3" size={5} className={styles.label}>
							Text
						</Heading>

						<Text size={2} as="p">
							Text to Recipes and Ingredients.
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
				</li>

				<li className={styles.card}>
					<Icon name="duotone-image" size={6} className={styles.icon} />

					<div className={styles.text}>
						<Heading level="h3" size={5} className={styles.label}>
							Photo
						</Heading>

						<Text size={2} as="p">
							Take a photo of a recipe.
						</Text>
					</div>

					<LinkButton
						href="/bar/recipes/create/photo"
						size="small"
						variant="solid"
						color="accent"
						className={styles.link}
					>
						Create Recipe
						<Icon name="arrow-right" size={1} />
					</LinkButton>
				</li>

				<li className={styles.card}>
					<Icon name="duotone-table-tree" size={6} className={styles.icon} />

					<div className={styles.text}>
						<Heading level="h3" size={5} className={styles.label}>
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
				</li>
			</ul>

			<LinkButton href="/bar/recipes" size="tiny" variant="text" color="accent">
				View all Recipes
			</LinkButton>
		</nav>
	);
}
