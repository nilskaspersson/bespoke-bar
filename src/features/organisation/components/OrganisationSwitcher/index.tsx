"use client";

import { OrganizationSwitcher as ClerkOrganizationSwitcher } from "@clerk/nextjs";
import { clsx } from "clsx";
import { Suspense } from "react";
import { AuthProvider } from "@/components/AuthProvider";
import { OrganisationSettings } from "@/features/organisation/components/OrganisationSettings";
import { Icon } from "@/ui/Icon";
import { Skeleton } from "@/ui/Skeleton";
import styles from "./styles.module.css";

export function OrganisationSwitcher({ className }: { className?: string }) {
	return (
		<Suspense
			fallback={
				<OrganisationSwitcherSkeleton
					className={clsx(className, styles.switcher)}
				/>
			}
		>
			<div className={clsx(className, styles.switcher)}>
				<AuthProvider>
					<ClerkOrganizationSwitcher hidePersonal hideSlug>
						<ClerkOrganizationSwitcher.OrganizationProfilePage
							label="Locale & Currency"
							url="settings"
							labelIcon={<Icon name="gear" className={styles.icon} />}
						>
							<OrganisationSettings />
						</ClerkOrganizationSwitcher.OrganizationProfilePage>
					</ClerkOrganizationSwitcher>
				</AuthProvider>
			</div>
		</Suspense>
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
