import { clsx } from "clsx";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
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
									<Link className={styles.link} href={`${barUrl}/menus`}>
										Menus
									</Link>
								</li>

								<li>
									<Link className={styles.link} href={`${barUrl}/recipes`}>
										Recipes
									</Link>
								</li>

								<li>
									<Link className={styles.link} href={`${barUrl}/ingredients`}>
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
									<Link className={styles.link} href={`${loungeUrl}/terms`}>
										Terms & conditions
									</Link>
								</li>

								<li>
									<Link className={styles.link} href={`${loungeUrl}/privacy`}>
										Privacy policy
									</Link>
								</li>
							</Text>
						</Grid>

						<Grid gap={1}>
							<Heading level="h6" size={2}>
								Public
							</Heading>

							<Text as="ul" size={2}>
								<li>
									<Link className={styles.link} href={loungeUrl}>
										Landing page
									</Link>
								</li>

								<li>
									<Link
										className={styles.link}
										href={`${loungeUrl}/tools/cocktail-calculator`}
									>
										Cocktail calculator
									</Link>
								</li>
							</Text>
						</Grid>
					</nav>

					{children ? (
						<Grid gap={4} className={styles.settings}>
							{children}
						</Grid>
					) : null}
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
