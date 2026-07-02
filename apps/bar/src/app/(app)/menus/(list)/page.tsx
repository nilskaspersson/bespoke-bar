import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";

export default function MenusPage() {
	return (
		<PageHeader
			tagline="Arrange your recipes into menus for service."
			overline="Menus"
			icon="duotone-memo-pad"
			heading="Compose a menu"
		/>
	);
}

export const metadata: Metadata = {
	title: "Menus",
};
