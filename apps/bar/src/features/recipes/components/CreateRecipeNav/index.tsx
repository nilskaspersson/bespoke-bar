import { Chip } from "@bespoke/ui/Chip";
import { Flex } from "@bespoke/ui/Flex";
import { Grid, type GridProps } from "@bespoke/ui/Grid";
import { Heading } from "@bespoke/ui/Heading";
import { Icon } from "@bespoke/ui/Icon";
import type { IconName } from "@bespoke/ui/icons/types";
import { Text } from "@bespoke/ui/Text";
import { clsx } from "clsx";
import Link from "next/link";
import styles from "./styles.module.css";

export type CreateRecipeMethod = "text" | "photo" | "structured";

type CardSpec = {
	method: CreateRecipeMethod;
	icon: IconName;
	title: string;
	hook: string;
	description: string;
	href: string;
	caption?: string;
	meta?: string;
	featured?: boolean;
};

function getCards(onBoarding?: boolean): CardSpec[] {
	return [
		{
			method: "text",
			icon: "duotone-input-text",
			title: "Text Editor",
			hook: "Paste from your notes",
			description: "Text to Recipes and Ingredients.",
			href: "/recipes/create/text",
			caption: onBoarding ? "Good starting point" : undefined,
			featured: onBoarding,
		},
		{
			method: "photo",
			icon: "duotone-image",
			title: "Photo",
			hook: "Snap a napkin",
			description: "Create Recipes from a photo.",
			href: "/recipes/create/photo",
			meta: "3 free per day",
		},
		{
			method: "structured",
			icon: "duotone-table-tree",
			title: "Structured",
			hook: "Full control",
			description: "Create a Recipe with a structured form.",
			href: "/recipes/create/structured",
		},
	];
}

export function CreateRecipeNav({
	active,
	children,
	className,
	compact,
	onBoarding,
	...props
}: GridProps & {
	active?: CreateRecipeMethod;
	compact?: boolean;
	onBoarding?: boolean;
}) {
	const cards = getCards(onBoarding);

	return (
		<Grid
			as="nav"
			gap={4}
			className={clsx(className, styles.nav, { [styles.compact]: compact })}
			{...props}
		>
			<ul className={styles.list}>
				{cards.map((card) => (
					<li key={card.method} className={styles.item}>
						<Link
							href={card.href}
							className={clsx(styles.card, {
								[styles.featured]: card.featured,
							})}
							aria-label={card.title}
							aria-description={card.description}
							aria-current={card.method === active ? "page" : undefined}
						>
							{!compact ? (
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
							) : null}

							<Grid gap={4} justifyItems="center" className={styles.content}>
								<Icon
									name={card.icon}
									size={compact ? 4 : 7}
									className={styles.icon}
								/>

								<hgroup>
									<Heading
										level="h3"
										size={compact ? 2 : 5}
										className={styles.label}
									>
										{card.title}
									</Heading>

									{!compact ? (
										<Text
											size={2}
											as="p"
											align="center"
											weight={500}
											className={styles.hook}
										>
											{card.hook}
										</Text>
									) : null}
								</hgroup>

								{!compact ? (
									<Text size={1} as="p">
										{card.description}
									</Text>
								) : null}
							</Grid>
						</Link>
					</li>
				))}
			</ul>

			{children}
		</Grid>
	);
}
