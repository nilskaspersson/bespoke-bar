import { clsx } from "clsx";
import { cacheTag } from "next/cache";
import Link from "next/link";
import type { ComponentProps } from "react";
import { ThemePicker } from "@/app/components/ThemePicker";
import { WakeLock } from "@/app/components/WakeLock";
import { Flex } from "@/ui/Flex";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

export async function AppFooter({
	className,
	...props
}: Omit<ComponentProps<"footer">, "children">) {
	return (
		<footer
			className={clsx(styles.footer, className)}
			data-force-theme="dark"
			{...props}
		>
			<Grid className={styles.contain} gap={6}>
				<Flex gap={6} wrap justifyContent="space-between">
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

					<Grid gap={4} className={styles.settings}>
						<ThemePicker />
						<WakeLock size="small" />
					</Grid>
				</Flex>

				<div>
					<Copyright />

					{process.env.VERCEL_GIT_COMMIT_SHA ? (
						// biome-ignore lint/correctness/useUniqueElementIds: Stable reference wanted
						<Text
							as="div"
							size={1}
							className={styles.commit}
							id="commit"
							aria-hidden="true"
						>
							{process.env.VERCEL_GIT_COMMIT_SHA}
						</Text>
					) : null}
				</div>
			</Grid>
		</footer>
	);
}

async function Copyright() {
	"use cache";
	cacheTag("current-year");

	return (
		<Text as="div" size={1} light>
			Copyright © {new Date().getFullYear()} Bespoke Bar
		</Text>
	);
}
