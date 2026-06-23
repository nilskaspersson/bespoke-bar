import { AnimatedBackground } from "@bespoke/ui/AnimatedBackground";
import { Container } from "@bespoke/ui/Container";
import { Heading } from "@bespoke/ui/Heading";
import { clsx } from "clsx";
import type { ComponentProps } from "react";
import styles from "./styles.module.css";

export function LandingPageHero({
	children,
	className,
	...props
}: ComponentProps<"div">) {
	return (
		<div className={clsx(styles.main, className)} {...props}>
			<AnimatedBackground />

			<Container as="section" className={styles.hero}>
				<Heading level="h1" className={styles.heading}>
					<span className={styles.tagline}>Mise en place</span>
					<br />
					<span className={styles.lower}>Beyond your bar</span>
				</Heading>
			</Container>

			<div className={styles.content}>{children}</div>
		</div>
	);
}
