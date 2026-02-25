import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { AppSidebar } from "@/components/AppSidebar";
import { Providers } from "@/components/Providers";
import { SecondaryNavigation } from "@/components/SecondaryNavigation";
import { IngredientEditorDrawer } from "@/features/ingredients/components/IngredientEditorDrawer";
import { getOrCreateLocalOrganisation } from "@/features/organisation/api/getOrCreateLocalOrganisation";
import { RecipeCardModal } from "@/features/recipes/components/RecipeCardModal/loader";
import styles from "./layout.module.css";

export default async function Layout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { userId, orgId, redirectToSignIn } = await auth();

	if (!userId) {
		return redirectToSignIn();
	}

	const organisation = await getOrCreateLocalOrganisation(orgId, userId);

	return (
		<Providers organisation={organisation}>
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
