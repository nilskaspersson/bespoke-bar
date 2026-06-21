"use client";

import { formatPrice } from "@bespoke/domain/billing/formatPrice";
import { clsx } from "clsx";
import { type ComponentProps, use, useTransition } from "react";
import { createProCheckout } from "@/features/billing/api/createProCheckout";
import { BillingPortalButton } from "@/features/billing/components/BillingPortalButton";
import { BillingStatusBadge } from "@/features/billing/components/BillingStatusBadge";
import { navigateToStripe } from "@/features/billing/navigateToStripe";
import { FormatterContext } from "@/hooks/useFormatter";
import { trpc } from "@/trpc/client";
import { Button } from "@/ui/Button";
import { Callout } from "@/ui/Callout";
import { Flex } from "@/ui/Flex";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import { Skeleton } from "@/ui/Skeleton";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

export function BillingPlan({
	className,
	...props
}: Omit<ComponentProps<"section">, "children">) {
	const { dateTimeFormatter, options } = use(FormatterContext);
	const { data: subscription } = trpc.billing.subscription.useQuery();
	const { data: config } = trpc.billing.config.useQuery();
	const [isPending, startTransition] = useTransition();

	function openCheckout() {
		startTransition(() =>
			navigateToStripe(
				createProCheckout(),
				"Opening secure checkout…",
				"Could not start checkout",
			),
		);
	}

	const isLoading = config === undefined || subscription === undefined;

	if (!isLoading && !config?.billingConfigured) {
		return (
			<Callout color="amber" heading="Billing unavailable">
				Billing isn't configured in this environment.
			</Callout>
		);
	}

	const isPro = subscription?.isPro ?? false;
	const attention = subscription?.attention ?? null;
	const price = formatPrice(config?.proPrice, options.locale);
	const periodEnd = subscription
		? dateTimeFormatter.format(new Date(subscription.currentPeriodEnd))
		: null;
	const canManage = Boolean(subscription) || config?.hasBillingHistory;
	// No upgrade CTA while a subscription is in limbo, that path ends in two subscriptions.
	const showUpgrade = !isPro && !attention;

	return (
		<Grid
			as="section"
			gap={4}
			className={clsx(className, styles.plan)}
			{...props}
		>
			<span className={styles.rings} aria-hidden />
			<span className={styles.frame} aria-hidden />

			<Flex
				as="header"
				gap={4}
				wrap
				alignItems="flex-start"
				justifyContent="space-between"
			>
				<Flex gap={4} alignItems="center">
					<span className={styles.planBadge} aria-hidden>
						<Icon name="trophy" size={4} />
					</span>

					<Heading level="h2" size={6} className={styles.heading}>
						Bespoke Bar Pro
					</Heading>

					<BillingStatusBadge size={0} attention={attention} isPro={isPro} />
				</Flex>

				{price ? (
					<Text size={4} heavy numeric weight={700}>
						{price.amount}
						{price.interval ? `/${price.interval}` : ""}
					</Text>
				) : isLoading ? (
					<Skeleton variant="text" width="101px" height="27px" />
				) : null}
			</Flex>

			{isLoading ? (
				<Skeleton variant="block" width="420px" height="48px" />
			) : (
				<Text as="p" heavy balance>
					{isPro ? "You're getting" : null} 50 photo scans a month, plus 5
					permanent recipe slots for every month you stay a member.
				</Text>
			)}

			{attention === "pending_first_payment" ? (
				<Callout size={1} color="amber" heading="Payment processing">
					Your Pro subscription will unlock the moment the payment is confirmed.
					This usually only takes a few moments, but some payment methods take a
					few days.
				</Callout>
			) : null}

			{attention === "payment_failed" ? (
				<Callout size={1} color="red" heading="Payment failed">
					Pro is paused until payment goes through. Update your payment method
					under Manage billing.
				</Callout>
			) : null}

			<Grid gap={4}>
				{isLoading ? (
					<Skeleton width="240px" height="18px" />
				) : isPro && periodEnd ? (
					<Flex gap={4} alignItems="baseline" wrap>
						<Text size={1} weight={600}>
							{subscription?.cancelAtPeriodEnd
								? `Your membership ends ${periodEnd}`
								: `Renews ${periodEnd}`}
						</Text>

						{!subscription?.cancelAtPeriodEnd ? (
							<BillingPortalButton
								variant="text"
								color="regular"
								className={styles.cancelLink}
							>
								Cancel subscription
							</BillingPortalButton>
						) : null}
					</Flex>
				) : null}

				<Flex gap={4} wrap alignItems="center">
					{isLoading ? (
						<Skeleton width="140px" height="32px" />
					) : showUpgrade ? (
						<Button
							size="small"
							variant="clear"
							color="amber"
							onClick={openCheckout}
							disabled={!config?.proConfigured || isPending}
							endAdornment={<Icon name="trophy" />}
						>
							Upgrade to Pro
						</Button>
					) : null}

					{canManage ? (
						<BillingPortalButton
							size="small"
							color="accent"
							variant="clear"
							endAdornment={<Icon name="arrow-right" />}
						>
							Manage billing
						</BillingPortalButton>
					) : null}
				</Flex>
			</Grid>
		</Grid>
	);
}
