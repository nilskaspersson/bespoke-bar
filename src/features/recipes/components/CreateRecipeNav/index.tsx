import { clsx } from "clsx";
import Link from "next/link";
import { useMemo } from "react";
import type { IconName } from "@/libs/icons/types";
import { Chip } from "@/ui/Chip";
import { Flex } from "@/ui/Flex";
import { Grid, type GridProps } from "@/ui/Grid";
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
	featured?: boolean;
};

export function CreateRecipeNav({
	children,
	className,
	onBoarding,
	...props
}: GridProps & { onBoarding?: boolean }) {
	const cards: CardSpec[] = useMemo(
		() =>
			[
				{
					icon: "duotone-input-text",
					title: "Text",
					hook: "Paste from your notes",
					description: "Text to Recipes and Ingredients.",
					href: "/bar/recipes/create/text",
					caption: onBoarding ? "Good starting point" : undefined,
					featured: onBoarding,
				},
				{
					icon: "duotone-image",
					title: "Photo",
					hook: "Snap a napkin",
					description: "Create Recipes from a photo.",
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
			] as const,
		[onBoarding],
	);

	return (
		<Grid as="nav" gap={4} {...props}>
			<ul className={styles.list}>
				{cards.map((card) => (
					<li key={card.title} className={styles.item}>
						<Link
							href={card.href}
							className={clsx(styles.card, {
								[styles.featured]: card.featured,
							})}
							aria-label={card.title}
							aria-description={card.description}
						>
							<Flex
								className={styles.top}
								gap={2}
								alignItems="center"
								justifyContent="space-between"
							>
								<Flex gap={2}>
									{card.caption ? (
										<Chip variant="filled" size={1} compact weight={600}>
											{card.caption}
										</Chip>
									) : null}

									{card.meta ? (
										<Chip size={1} variant="outline" color="amber">
											{card.meta}
										</Chip>
									) : null}
								</Flex>

								<Icon name="arrow-right" size={4} className={styles.arrow} />
							</Flex>

							<Grid gap={4} justifyItems="center" className={styles.content}>
								<Icon name={card.icon} size={7} className={styles.icon} />

								<hgroup>
									<Heading level="h3" size={5} className={styles.label}>
										{card.title}
									</Heading>

									<Text size={2} as="p" weight={500} className={styles.hook}>
										{card.hook}
									</Text>
								</hgroup>

								<Text size={1} as="p">
									{card.description}
								</Text>
							</Grid>
						</Link>
					</li>
				))}
			</ul>

			{children}
		</Grid>
	);
}
