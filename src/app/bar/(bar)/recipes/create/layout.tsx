import { Container } from "@/ui/Container";
import { Heading } from "@/ui/Heading";
import styles from "./layout.module.css";

export default async function Layout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<Container as="article" className={styles.container}>
			<header className={styles.header}>
				<Heading level="h1">Create Recipe</Heading>
			</header>

			{children}
		</Container>
	);
}
