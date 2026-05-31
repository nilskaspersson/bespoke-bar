import { Icon } from "@/ui/Icon";
import { Tooltip } from "@/ui/Tooltip";
import styles from "./styles.module.css";

const label = "Auto-filled.";
const description = "Check for inaccuracies.";

/**
 * Marks a value as Auto-filled by Enrichment.
 */
export function EnrichmentMark() {
	return (
		<Tooltip
			content={`${label} ${description}`}
			className={styles.mark}
			role="img"
			aria-label={label}
		>
			<Icon name="sparkles" size={1} />
		</Tooltip>
	);
}
