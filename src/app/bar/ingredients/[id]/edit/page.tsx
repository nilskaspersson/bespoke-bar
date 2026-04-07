import { notFound } from "next/navigation";
import { Suspense } from "react";
import { OrgProvider } from "@/components/OrgProvider";
import { getCachedIngredient } from "@/features/ingredients/api/readIngredient";
import { Container } from "@/ui/Container";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Skeleton, SkeletonScreen } from "@/ui/Skeleton";
import { authOrForbidden } from "@/utils/auth";
import { EditIngredientPageForm } from "./EditIngredientPageForm";
import styles from "./page.module.css";

type Props = {
	params: Promise<{ id?: string }>;
	searchParams: Promise<{ returnTo?: string }>;
};

export default function EditIngredientPage({
	params: paramsPromise,
	searchParams: searchParamsPromise,
}: Props) {
	return (
		<Container as="article" className={styles.container}>
			<Grid gap={4}>
				<Heading level="h1">Edit ingredient</Heading>

				<Suspense
					fallback={
						<SkeletonScreen>
							<Skeleton width="100%" height="40lvh" />
						</SkeletonScreen>
					}
				>
					<EditIngredientWithAuth
						paramsPromise={paramsPromise}
						searchParamsPromise={searchParamsPromise}
					/>
				</Suspense>
			</Grid>
		</Container>
	);
}

async function EditIngredientWithAuth({
	paramsPromise,
	searchParamsPromise,
}: {
	paramsPromise: Promise<{ id?: string }>;
	searchParamsPromise: Promise<{ returnTo?: string }>;
}) {
	const [{ id }, { returnTo }] = await Promise.all([
		paramsPromise,
		searchParamsPromise,
	]);

	if (!id) {
		notFound();
	}

	const { orgId } = await authOrForbidden();
	const ingredient = await getCachedIngredient(orgId, id);

	if (!ingredient) {
		notFound();
	}

	return (
		<OrgProvider>
			<EditIngredientPageForm ingredient={ingredient} redirectTo={returnTo} />
		</OrgProvider>
	);
}
