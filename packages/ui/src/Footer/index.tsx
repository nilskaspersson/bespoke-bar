import { clsx } from "clsx";
import { cacheLife, cacheTag } from "next/cache";
import type { ComponentProps, ReactNode } from "react";
import { Flex } from "../Flex";
import { Grid } from "../Grid";
import { Heading } from "../Heading";
import { Text } from "../Text";
import styles from "./styles.module.css";

type FooterProps = Omit<ComponentProps<"footer">, "children"> & {
	barUrl?: string;
	loungeUrl?: string;
	children?: ReactNode;
};

export async function Footer({
	className,
	barUrl = "",
	loungeUrl = "",
	children,
	...props
}: FooterProps) {
	"use cache";
	cacheLife("max");

	return (
		<footer
			className={clsx(styles.footer, className)}
			data-theme="dark"
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
									<a href={barUrl || "/"}>Overview</a>
								</li>

								<li>
									<a href={`${barUrl}/menus`}>Menus</a>
								</li>

								<li>
									<a href={`${barUrl}/recipes`}>Recipes</a>
								</li>

								<li>
									<a href={`${barUrl}/ingredients`}>Ingredients</a>
								</li>
							</Text>
						</Grid>

						<Grid gap={1}>
							<Heading level="h6" size={2}>
								Legal
							</Heading>

							<Text as="ul" size={2}>
								<li>
									<a href={`${loungeUrl}/terms`}>Terms & conditions</a>
								</li>

								<li>
									<a href={`${loungeUrl}/privacy`}>Privacy policy</a>
								</li>
							</Text>
						</Grid>
					</nav>

					<Grid gap={4} className={styles.settings}>
						{children}
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
	cacheLife("max");
	cacheTag("current-year");

	return (
		<Text as="div" size={1} light>
			Copyright © {new Date().getFullYear()} Bespoke Bar
		</Text>
	);
}
