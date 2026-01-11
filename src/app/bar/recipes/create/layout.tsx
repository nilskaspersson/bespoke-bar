import { PageHeader } from "@/components/PageHeader";
import { Container } from "@/ui/Container";
import styles from "./layout.module.css";

export default async function Layout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<Container as="article" className={styles.container}>
			<PageHeader heading="Create Recipe" />

			{children}
		</Container>
	);
}
