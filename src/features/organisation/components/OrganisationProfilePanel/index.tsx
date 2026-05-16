"use client";

import { OrganizationProfile } from "@clerk/nextjs";
import { OrganisationLocaleSettings } from "@/features/organisation/components/OrganisationLocaleSettings";
import { TagsSettings } from "@/features/tags/components/TagsSettings";
import { Icon } from "@/ui/Icon";
import styles from "./styles.module.css";

const fluid = { width: "100%", minWidth: 0 } as const;

export function OrganisationProfilePanel() {
	return (
		<div className={styles.panel}>
			<OrganizationProfile
				routing="hash"
				appearance={{
					elements: {
						rootBox: fluid,
						cardBox: { ...fluid, backgroundColor: "var(--mauve-4)" },
						card: fluid,
						main: fluid,
						pageScrollBox: fluid,
						page: fluid,
					},
				}}
			>
				<OrganizationProfile.Page
					label="Locale & Currency"
					url="locale"
					labelIcon={<Icon name="gear" />}
				>
					<OrganisationLocaleSettings />
				</OrganizationProfile.Page>

				<OrganizationProfile.Page
					label="Recipe tags"
					url="tags"
					labelIcon={<Icon name="tags" />}
				>
					<TagsSettings />
				</OrganizationProfile.Page>
			</OrganizationProfile>
		</div>
	);
}
