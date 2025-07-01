import type { Metadata } from "next";
import { LinkButton } from "@/ui/Button";
import { Text } from "@/ui/Text";
import styles from "./page.module.css";

export default async function CreateRecipePage() {
	return (
		<section>
			<nav className={styles.nav}>
				<LinkButton
					href="/bar/recipes/create"
					inert
					aria-disabled
					variant="solid"
					color="heavy"
					fullWidth
				>
					Single recipe
				</LinkButton>

				<Text>or</Text>

				<LinkButton
					href="/bar/recipes/create/bulk"
					variant="solid"
					color="accent"
					fullWidth
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
