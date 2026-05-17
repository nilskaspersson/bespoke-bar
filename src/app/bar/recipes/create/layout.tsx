import styles from "./layout.module.css";

export default async function Layout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <article className={styles.container}>{children}</article>;
}
