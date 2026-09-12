import { AnimatedBackground } from "@bespoke/ui/AnimatedBackground";
import { Heading } from "@bespoke/ui/Heading";
import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import styles from "./styles.module.css";

export function LandingPageHero({
	aside,
	backdrop,
	children,
	className,
	...props
}: ComponentProps<"div"> & { aside?: ReactNode; backdrop?: ReactNode }) {
	return (
		<div className={clsx(styles.main, className)} {...props}>
			<AnimatedBackground />

			{backdrop ? <div className={styles.backdrop}>{backdrop}</div> : null}

			<div className={styles.container}>
				<section className={styles.hero}>
					<Heading level="h1" className={styles.heading}>
						An archive for your{" "}
						<strong className={styles.mark}>cocktail recipes</strong>.
					</Heading>

					{aside ? <div className={styles.aside}>{aside}</div> : null}
				</section>
			</div>

			<div className={styles.content}>{children}</div>
		</div>
	);
}
