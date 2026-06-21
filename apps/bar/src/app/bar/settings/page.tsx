import { authOrForbidden } from "@bespoke/api/auth";
import { getCachedOrgSubscription } from "@bespoke/api/billing/getOrgSubscription";
import { hasStripeCustomer } from "@bespoke/api/billing/hasStripeCustomer";
import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { BillingPlan } from "@/features/billing/components/BillingPlan";
import { BillingUsage } from "@/features/billing/components/BillingUsage";
import { CheckoutResultToast } from "@/features/billing/components/CheckoutResultToast";
import { SettingsNav } from "@/features/organisation/components/SettingsNav";
import { Container } from "@/ui/Container";
import styles from "./page.module.css";

async function resolveHasBilling(): Promise<boolean> {
	const { orgId } = await authOrForbidden();
	const [subscription, hasCustomer] = await Promise.all([
		getCachedOrgSubscription(orgId),
		hasStripeCustomer(orgId),
	]);
	return Boolean(subscription) || hasCustomer;
}

export default function SettingsPage() {
	const hasBillingPromise = resolveHasBilling();

	return (
		<Container as="article" className={styles.container}>
			<PageHeader
				icon="gear"
				overline="Settings"
				heading="Organisation"
				tagline="Manage tags, locale, billing, and more."
			/>

			<div className={styles.body}>
				<BillingPlan />
				<SettingsNav hasBillingPromise={hasBillingPromise} />
				<BillingUsage />
			</div>

			<CheckoutResultToast />
		</Container>
	);
}

export const metadata: Metadata = {
	title: "Settings",
};
