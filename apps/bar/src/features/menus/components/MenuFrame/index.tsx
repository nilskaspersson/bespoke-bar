import type { MenuWithEntries } from "@bespoke/schema/schema/composite";
import { clsx } from "clsx";
import Link from "next/link";
import type { ComponentProps } from "react";
import { RecipesCountBadge } from "@/features/recipes/components/RecipesCountBadge";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import { Text } from "@/ui/Text";
import { Time } from "@/ui/Time";
import type { HeadingLevel } from "@/utils/types";
import styles from "./styles.module.css";

function OptionalLink({
	children,
	className,
	href,
	...linkProps
}: Partial<ComponentProps<typeof Link>>) {
	if (href) {
		return (
			<Link
				href={href}
				className={clsx(styles.link, className)}
				prefetch="auto"
				{...linkProps}
			>
				{children}
			</Link>
		);
	}

	return <div className={className}>{children}</div>;
}

export function MenuFrame({
	menu,
	children,
	className,
	href,
	level = "h3",
}: {
	menu: MenuWithEntries;
	href?: string;
	level?: HeadingLevel;
} & ComponentProps<"section">) {
	return (
		<OptionalLink
			href={href}
			className={clsx(styles.card, className, {
				[styles.isFeatured]: menu.isFeatured,
			})}
			aria-label={`View menu ${menu.name}`}
		>
			<div aria-hidden="true" className={styles.badge}>
				<div className={styles.icon}>
					<Icon name={menu.isFeatured ? "star" : "memo-pad"} size={5} />
				</div>
			</div>

			<div className={styles.bevel}>
				<div className={styles.inner}>
					<Heading level={level} serif className={styles.name}>
						{menu.name}
					</Heading>

					{menu.description ? (
						<Text as="p" size={3} serif balance>
							{menu.description}
						</Text>
					) : null}

					<RecipesCountBadge count={menu.entries.length} color="amber" />
				</div>

				{children}
			</div>

			<footer className={styles.stats}>
				<Text size={1} light className={styles.stat}>
					Created: <Time date={menu.createdAt} />
				</Text>

				{menu.updatedAt ? (
					<Text size={1} light className={styles.stat}>
						{" "}
						Updated: <Time date={menu.updatedAt} />
					</Text>
				) : null}
			</footer>
		</OptionalLink>
	);
}
