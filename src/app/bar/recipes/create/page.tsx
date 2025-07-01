import type { Metadata } from "next";
import { LinkButton } from "@/ui/Button";
import { Text } from "@/ui/Text";

export default async function CreateRecipePage() {
	return (
		<section>
			<nav>
				<LinkButton
					href="/bar/recipes/create"
					inert
					aria-disabled
					variant="solid"
					color="heavy"
				>
					Single recipe
				</LinkButton>

				<Text>or</Text>

				<LinkButton
					href="/bar/recipes/create/bulk"
					variant="solid"
					color="accent"
				>
					Bulk creation
				</LinkButton>
			</nav>
		</section>
	);
}

export const metadata: Metadata = {
	title: "Create Recipe",
};
