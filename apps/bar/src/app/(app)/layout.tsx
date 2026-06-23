import { Flex } from "@bespoke/ui/Flex";
import { Icon } from "@bespoke/ui/Icon";
import { LoadingScreen } from "@bespoke/ui/LoadingScreen";
import type { Metadata } from "next";
import { Suspense } from "react";
import { AppNavToggle } from "@/components/AppNavToggle";
import { BottomRailHost } from "@/components/BottomRail";
import { OrgProvider } from "@/components/OrgProvider";
import { Providers } from "@/components/Providers";
import { IngredientEditorDrawer } from "@/features/ingredients/components/IngredientEditorDrawer";
import { CreateMenuEntryDrawer } from "@/features/menus/entries/components/CreateMenuEntryDrawer";
import { RecipeCardModal } from "@/features/recipes/components/RecipeCardModal/loader";
import { SearchRecipesButton } from "@/features/recipes/components/SearchRecipesForm";
import styles from "./layout.module.css";

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<Providers>
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
					{/*
					 * OrgProvider reads auth and supplies the org formatter context the
					 * pages and overlays consume. Isolating it (with a real fallback) lets
					 * the rail and page frame above prerender into the static shell.
					 */}
					<Suspense fallback={<LoadingScreen />}>
						<OrgProvider>
							{children}

							<IngredientEditorDrawer />
							<CreateMenuEntryDrawer />
							<RecipeCardModal />
						</OrgProvider>
					</Suspense>
				</BottomRailHost>
			</div>
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
