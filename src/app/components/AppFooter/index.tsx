import { clsx } from "clsx";
import Link from "next/link";
import type { ComponentProps } from "react";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";

import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

export function AppFooter({
	className,
	...props
}: Omit<ComponentProps<"footer">, "children">) {
	return (
		<footer
			className={clsx(styles.footer, className)}
			data-theme="dark"
			{...props}
		>
			<Grid className={styles.contain} gap={6}>
				<nav className={styles.nav}>
					<Grid gap={1}>
						<Heading level="h6" size={2}>
							Bar
						</Heading>

						<Text as="ul" size={2}>
							<li>
								<Link href="/bar" prefetch={false}>
									Overview
								</Link>
							</li>

							<li>
								<Link href="/bar/lists" prefetch={false}>
									Lists
								</Link>
							</li>

							<li>
								<Link href="/bar/recipes" prefetch={false}>
									Recipes
								</Link>
							</li>

							<li>
								<Link href="/bar/ingredients" prefetch={false}>
									Ingredients
								</Link>
							</li>
						</Text>
					</Grid>

					<Grid gap={1}>
						<Heading level="h6" size={2}>
							Legal
						</Heading>

						<Text as="ul" size={2}>
							<li>
								<Link href="/terms" prefetch={false}>
									Terms & conditions
								</Link>
							</li>

							<li>
								<Link href="/privacy" prefetch={false}>
									Privacy policy
								</Link>
							</li>
						</Text>
					</Grid>
				</nav>

				<div>
					<Text as="div" size={1} light>
						Copyright © {new Date().getFullYear()} Bespoke Bar
					</Text>

					{process.env.VERCEL_GIT_COMMIT_SHA ? (
						<Text as="div" size={1} light className={styles.commit} id="commit">
							{process.env.VERCEL_GIT_COMMIT_SHA}
						</Text>
					) : null}
				</div>
			</Grid>
		</footer>
	);
}
