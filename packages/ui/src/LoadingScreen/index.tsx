"use client";

import { usePathname } from "next/navigation";
import { Flex } from "../Flex";
import { Grid } from "../Grid";
import { Spinner } from "../Spinner";
import { Text } from "../Text";
import styles from "./styles.module.css";

export function LoadingScreen() {
	const pathname = usePathname();

	return (
		<aside className={styles.loading}>
			<Grid gap={6}>
				<Flex alignItems="center" direction="column" gap={2}>
					<Spinner size={8} />

					<Text as="p" size={4} align="center">
						Shaking up the page…
					</Text>
				</Flex>

				<Grid gap={2} className={styles.stuck} justifyItems="center">
					<Text as="p" weight={700}>
						Stuck? Try <a href={pathname}>reloading the page</a>
					</Text>
				</Grid>
			</Grid>
		</aside>
	);
}
