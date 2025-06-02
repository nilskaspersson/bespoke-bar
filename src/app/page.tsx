import { DraftSpecs } from "@/features/specs/components/DraftSpecs";
import styles from "./page.module.css";

export default async function Home() {
	return (
		<section className={styles.main}>
			<DraftSpecs />
		</section>
	);
}
