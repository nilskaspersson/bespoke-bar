import { clsx } from "clsx";
import Link from "next/link";
import { type ComponentProps, useMemo } from "react";
import type { IconName } from "@/libs/icons/types";
import { Chip } from "@/ui/Chip";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

type CardSpec = {
	icon: IconName;
	title: string;
	hook: string;
	description: string;
	href: string;
	caption?: string;
	meta?: string;
};

export function CreateRecipeNav({
	children,
	className,
	...props
}: ComponentProps<"nav">) {
	const cards: CardSpec[] = useMemo(
		() => [
			{
				icon: "duotone-input-text",
				title: "Text",
				hook: "Paste from your notes",
				description: "Text to Recipes and Ingredients.",
				href: "/bar/recipes/create/text",
				caption: "Recommended starting point",
			},
			{
				icon: "duotone-image",
				title: "Photo",
				hook: "Snap a napkin",
				description: "Take a photo of a recipe.",
				href: "/bar/recipes/create/photo",
				meta: "3 free per day",
			},
			{
				icon: "duotone-table-tree",
				title: "Structured",
				hook: "Full control",
				description: "Create a Recipe with a structured form.",
				href: "/bar/recipes/create/structured",
			},
		],
		[],
	);

	return (
		<nav className={clsx(styles.nav, className)} {...props}>
			<ul className={styles.list}>
				{cards.map((card) => (
					<li key={card.title} className={styles.card}>
						<Link
							href={card.href}
							className={styles.link}
							aria-label={card.title}
							aria-description={card.description}
						>
							<div className={styles.top}>
								{card.caption ? (
									<Chip
										variant="filled"
										size={1}
										compact
										weight={600}
										className={styles.captionChip}
									>
										{card.caption}
									</Chip>
								) : (
									<span />
								)}

								<Icon name="arrow-right" size={4} className={styles.arrow} />
							</div>

							<div className={styles.text}>
								<Icon name={card.icon} size={6} className={styles.icon} />

								<hgroup className={styles.hgroup}>
									<Heading level="h3" size={5} className={styles.label}>
										{card.title}
									</Heading>

									<Text
										size={2}
										as="p"
										weight={600}
										className={styles.hook}
										italic
									>
										{card.hook}
									</Text>
								</hgroup>

								<Text size={1} as="p" className={styles.description}>
									{card.description}
								</Text>
							</div>

							{card.meta ? (
								<div className={styles.bottom}>
									<Chip
										size={1}
										variant="outline"
										color="amber"
										className={styles.metaChip}
									>
										{card.meta}
									</Chip>
								</div>
							) : null}
						</Link>
					</li>
				))}
			</ul>

			{children}
		</nav>
	);
}
