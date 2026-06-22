import { Eyebrow } from "@bespoke/ui/Eyebrow";
import { Grid } from "@bespoke/ui/Grid";
import { Heading } from "@bespoke/ui/Heading";
import { HGroup } from "@bespoke/ui/HGroup";
import type { IconName } from "@bespoke/ui/icons/types";
import { Text } from "@bespoke/ui/Text";
import type { ReactNode } from "react";
import styles from "./styles.module.css";

type Props = {
	heading: string;
	overline?: string;
	icon?: IconName;
	tagline?: ReactNode;
	children?: ReactNode;
};

export function PageHeader({
	heading,
	overline,
	icon,
	tagline,
	children,
}: Props) {
	return (
		<Grid as="header" className={styles.header} gap={6} justifyItems="center">
			<HGroup
				overline={
					overline || icon ? (
						<Eyebrow icon={icon}>{overline}</Eyebrow>
					) : undefined
				}
				tagline={
					tagline ? (
						<Text as="p" align="center" size={3} balance>
							{tagline}
						</Text>
					) : undefined
				}
			>
				<Heading level="h1" size={8} align="center">
					{heading}
				</Heading>
			</HGroup>

			{children}
		</Grid>
	);
}
