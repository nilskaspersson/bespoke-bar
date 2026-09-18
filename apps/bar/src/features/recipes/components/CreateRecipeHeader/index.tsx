import { Heading } from "@bespoke/ui/Heading";
import { HGroup } from "@bespoke/ui/HGroup";
import { Icon } from "@bespoke/ui/Icon";
import { Text } from "@bespoke/ui/Text";
import Link from "next/link";
import {
	type CreateRecipeMethod,
	CreateRecipeNav,
} from "@/features/recipes/components/CreateRecipeNav";
import styles from "./styles.module.css";

export function CreateRecipeHeader({
	active,
	heading,
	tagline,
}: {
	active: CreateRecipeMethod;
	heading: string;
	tagline: string;
}) {
	return (
		<header className={styles.header}>
			<HGroup
				overline={
					<Text
						as={Link}
						href="/recipes/create"
						size={2}
						weight={700}
						className={styles.overline}
					>
						Create Recipes
					</Text>
				}
			>
				<Heading level="h1" size={7}>
					{heading}
				</Heading>

				<Text as="p" size={3} italic>
					“{tagline}”
				</Text>
			</HGroup>

			<CreateRecipeNav active={active} compact />
		</header>
	);
}
