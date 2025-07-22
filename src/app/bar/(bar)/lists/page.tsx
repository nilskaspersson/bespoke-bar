import type { Metadata } from "next";
import Link from "next/link";
import { readBarRecipeLists } from "@/features/lists/actions/readBarRecipeLists";
import { getRecipeListUrl } from "@/features/lists/utils";
import { LinkButton } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Flex } from "@/ui/Flex";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import { Text } from "@/ui/Text";
import styles from "./page.module.css";

export default async function ListsPage() {
	const lists = await readBarRecipeLists();

	return (
		<Container as="article" className={styles.container}>
			<Flex
				as="header"
				justifyContent="space-between"
				alignItems="center"
				wrap
				gap={4}
			>
				<Heading level="h1">Lists</Heading>

				<LinkButton
					href="/bar/lists/create"
					variant="solid"
					color="accent"
					size="small"
				>
					Create List
					<Icon name="duotone-memo-pad" />
				</LinkButton>
			</Flex>

			<Grid as="ul" gap={4}>
				{lists.map((list) => (
					<li key={list.id}>
						<Link href={getRecipeListUrl(list)}>{list.name}</Link>
						<br />
						<Text size={2} light>
							Recipes: {list.recipeCount}
						</Text>
					</li>
				))}
			</Grid>
		</Container>
	);
}

export const metadata: Metadata = {
	title: "Lists",
};
