import { StatLinks } from "@/features/recipes/components/StatLinks";
import { LinkButton } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import styles from "./layout.module.css";

export default async function Layout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<Container as="article" className={styles.container}>
			<header className={styles.header}>
				<Heading level="h1">Recipes</Heading>

				<LinkButton
					href="/bar/recipes/create/bulk"
					variant="solid"
					color="accent"
					size="small"
				>
					Create Recipe
					<Icon name="duotone-martini-glass" />
				</LinkButton>
			</header>

			<StatLinks className={styles.actions} />

			{children}
		</Container>
	);
}
