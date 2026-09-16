import { Grid } from "@bespoke/ui/Grid";
import { Panel } from "@bespoke/ui/Panel";
import { Skeleton } from "@bespoke/ui/Skeleton";
import { Text } from "@bespoke/ui/Text";
import styles from "./styles.module.css";

export function HandoffSkeleton() {
	return (
		<Panel
			footer={
				<div className={styles.status}>
					<Text as="p" heavy align="center">
						<Skeleton
							variant="text"
							width="20ch"
							height="1em"
							className={styles.statusLine}
						/>
					</Text>
				</div>
			}
		>
			<Grid gap={4} justifyItems="center">
				<Skeleton className={styles.placeholder} />
			</Grid>
		</Panel>
	);
}
