import type { Metadata } from "next";
import { AppNavToggle } from "@/components/AppNavToggle";
import { BottomRailHost } from "@/components/BottomRail";
import { OrgProvider } from "@/components/OrgProvider";
import { Providers } from "@/components/Providers";
import { IngredientEditorDrawer } from "@/features/ingredients/components/IngredientEditorDrawer";
import { CreateListEntryDrawer } from "@/features/lists/entries/components/CreateListEntryDrawer";
import { RecipeCardModal } from "@/features/recipes/components/RecipeCardModal/loader";
import { SearchRecipesButton } from "@/features/recipes/components/SearchRecipesForm";
import { Flex } from "@/ui/Flex";
import { Icon } from "@/ui/Icon";
import styles from "./layout.module.css";

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<Providers>
			<OrgProvider>
				<div className={styles.container}>
					<BottomRailHost
						left={
							<Flex gap={2} alignItems="center">
								<AppNavToggle />

								<SearchRecipesButton
									variant="clear"
									color="light"
									size="large"
									rounded
									icon
									aria-label="Quick search"
									title="Quick search"
								>
									<Icon name="magnifying-glass" size={4} />
								</SearchRecipesButton>
							</Flex>
						}
					>
						{children}
					</BottomRailHost>
				</div>

				<IngredientEditorDrawer />
				<CreateListEntryDrawer />
				<RecipeCardModal />
			</OrgProvider>
		</Providers>
	);
}

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: {
			template: `%s :: Bespoke Bar`,
			default: "Mise en place",
		},
	};
}
