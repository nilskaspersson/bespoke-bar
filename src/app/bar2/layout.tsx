import type { Metadata } from "next";
import { AppHeader } from "@/components/AppHeader";
import { BarSectionDock } from "@/components/BarSectionDock";
import { BottomRailHost } from "@/components/BottomRail";
import { OrgProvider } from "@/components/OrgProvider";
import { Providers } from "@/components/Providers";
import { IngredientEditorDrawer } from "@/features/ingredients/components/IngredientEditorDrawer";
import { CreateListEntryDrawer } from "@/features/lists/entries/components/CreateListEntryDrawer";
import { RecipeCardModal } from "@/features/recipes/components/RecipeCardModal/loader";
import styles from "./layout.module.css";

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<Providers>
			<OrgProvider>
				<AppHeader />

				<div className={styles.container}>
					<BottomRailHost left={<BarSectionDock />}>{children}</BottomRailHost>
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
