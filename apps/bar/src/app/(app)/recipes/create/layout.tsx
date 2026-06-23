import { Container } from "@bespoke/ui/Container";
import styles from "./layout.module.css";

export default async function Layout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<Container as="article" className={styles.container}>
			{children}
		</Container>
	);
}
