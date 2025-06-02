import { DraftSpecs } from "@/features/specs/components/DraftSpecs";
import styles from "./page.module.css";

export default function Home() {
	return (
		<section className={styles.main}>
			<DraftSpecs />
		</section>
	);
}
