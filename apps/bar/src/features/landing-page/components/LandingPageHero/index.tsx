import { clsx } from "clsx";
import type { ComponentProps } from "react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Container } from "@/ui/Container";
import { Heading } from "@/ui/Heading";
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
