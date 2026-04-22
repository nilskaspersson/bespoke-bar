import type { Metadata } from "next";
import { AppSidebar } from "@/components/AppSidebar";
import { Providers } from "@/components/Providers";
import { SecondaryNavigation } from "@/components/SecondaryNavigation";
import { IngredientEditorDrawer } from "@/features/ingredients/components/IngredientEditorDrawer";
import { CreateListEntryDrawer } from "@/features/lists/entries/components/CreateListEntryDrawer";
import { RecipeCardModal } from "@/features/recipes/components/RecipeCardModal/loader";
import styles from "./layout.module.css";

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<Providers>
			<div className={styles.container}>
				<AppSidebar
					className={styles.navigation}
					toggleButtonProps={{ className: styles.toggle }}
				>
					<SecondaryNavigation />
				</AppSidebar>

				<div className={styles.main}>{children}</div>
			</div>

			<IngredientEditorDrawer />
			<CreateListEntryDrawer />
			<RecipeCardModal />
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
