import type { Metadata } from "next";
import { readBarRecipeLists } from "@/features/lists/actions/readBarRecipeLists";
import { RecipeListCard } from "@/features/lists/components/RecipeListCard";
import { LinkButton } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Flex } from "@/ui/Flex";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
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

			<Grid as="ul" gap={8}>
				{lists.map((list) => (
					<li key={list.id}>
						<RecipeListCard list={list} />
					</li>
				))}
			</Grid>
		</Container>
	);
}

export const metadata: Metadata = {
	title: "Lists",
};
