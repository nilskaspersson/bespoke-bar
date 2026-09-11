import { LinkButton } from "@bespoke/ui/Button";
import { Container } from "@bespoke/ui/Container";
import { Grid } from "@bespoke/ui/Grid";
import { Heading } from "@bespoke/ui/Heading";
import { Icon } from "@bespoke/ui/Icon";
import { Text } from "@bespoke/ui/Text";
import clsx from "clsx";
import type { ComponentProps } from "react";
import styles from "./styles.module.css";

export function ClosingCta({
	barUrl,
	className,
	...props
}: { barUrl: string } & ComponentProps<"section">) {
	return (
		<section className={clsx(styles.base, className)} {...props}>
			<Container className={styles.inner}>
				<Grid gap={8} justifyContent="start">
					<Grid gap={4}>
						<Heading level="h2" className={styles.heading}>
							Keep every spec you've ever nailed.
						</Heading>

						<Text as="p" size={3} balance className={styles.body}>
							Free, no card needed. Copy or export your recipes whenever you
							like. They're yours.
						</Text>
					</Grid>

					<LinkButton
						href={`${barUrl}/recipes`}
						variant="solid"
						color="heavy"
						size="large"
					>
						Start your archive <Icon name="arrow-right" size={4} />
					</LinkButton>
				</Grid>
			</Container>
		</section>
	);
}
