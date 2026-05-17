"use client";

import {
	OrganizationSwitcher as ClerkOrganizationSwitcher,
	Show,
} from "@clerk/nextjs";
import { clsx } from "clsx";
import { AuthProvider } from "@/components/AuthProvider";
import { OrganisationLocaleSettings } from "@/features/organisation/components/OrganisationLocaleSettings";
import { TagsSettings } from "@/features/tags/components/TagsSettings";
import { Icon } from "@/ui/Icon";
import { Skeleton } from "@/ui/Skeleton";
import styles from "./styles.module.css";

export function OrganisationSwitcher({ className }: { className?: string }) {
	return (
		<Show when="signed-in">
			<div className={clsx(className, styles.switcher)}>
				<AuthProvider>
					<ClerkOrganizationSwitcher hidePersonal>
						<ClerkOrganizationSwitcher.OrganizationProfilePage
							label="Locale & Currency"
							url="settings"
							labelIcon={<Icon name="gear" className={styles.icon} />}
						>
							<OrganisationLocaleSettings />
						</ClerkOrganizationSwitcher.OrganizationProfilePage>

						<ClerkOrganizationSwitcher.OrganizationProfilePage
							label="Recipe tags"
							url="tags"
							labelIcon={<Icon name="tags" className={styles.icon} />}
						>
							<TagsSettings />
						</ClerkOrganizationSwitcher.OrganizationProfilePage>
					</ClerkOrganizationSwitcher>
				</AuthProvider>
			</div>
		</Show>
	);
}

export function OrganisationSwitcherSkeleton({
	className,
}: {
	className?: string;
}) {
	return (
		<div className={clsx(className, styles.switcher)}>
			<Skeleton width="100%" height="26px" />
		</div>
	);
}
