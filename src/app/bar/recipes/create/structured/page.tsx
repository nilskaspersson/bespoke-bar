import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { getCachedRecipeSlotUsage } from "@/features/billing/api/getRecipeSlotUsage";
import { RecipeSlotUsageProvider } from "@/features/billing/components/RecipeSlotUsageProvider";
import { getCachedIngredients } from "@/features/ingredients/api/readIngredients";
import { CreateRecipeNav } from "@/features/recipes/components/CreateRecipeNav";
import { FormDraftPreview } from "@/features/recipes/components/FormDraftPreview";
import { RecipeForm } from "@/features/recipes/components/RecipeForm";
import { Skeleton, SkeletonScreen } from "@/ui/Skeleton";
import { authOrForbidden } from "@/utils/auth";
import styles from "./page.module.css";

export default function CreateRecipePage() {
	return (
		<>
			<PageHeader
				overline="Recipes"
				icon="duotone-martini-glass"
				heading="Structured"
				tagline="Full control."
			>
				<CreateRecipeNav active="structured" compact />
			</PageHeader>

			<Suspense
				fallback={
					<SkeletonScreen>
						<Skeleton width="100%" height="60lvh" />
					</SkeletonScreen>
				}
			>
				<CreateRecipeWithAuth />
			</Suspense>
		</>
	);
}

async function CreateRecipeWithAuth() {
	const { orgId } = await authOrForbidden();
	const [ingredients, usage] = await Promise.all([
		getCachedIngredients(orgId),
		getCachedRecipeSlotUsage(orgId),
	]);

	return (
		<RecipeSlotUsageProvider value={usage}>
			<RecipeForm ingredients={ingredients}>
				<FormDraftPreview
					ingredients={ingredients}
					className={styles.preview}
				/>
			</RecipeForm>
		</RecipeSlotUsageProvider>
	);
}

export const metadata: Metadata = {
	title: "Create Recipe",
};
