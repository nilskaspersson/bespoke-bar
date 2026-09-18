import styles from "./styles.module.css";

export function PhotoScanEffect() {
	return (
		<div className={styles.scan} aria-hidden>
			<span className={styles.beam} />
		</div>
	);
}
