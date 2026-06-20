"use client";

import { clsx } from "clsx";
import { type ComponentProps, use } from "react";
import { SlotTopUp } from "@/features/billing/components/SlotTopUp";
import { UsageCard } from "@/features/billing/components/UsageCard";
import { FormatterContext } from "@/hooks/useFormatter";
import { trpc } from "@/trpc/client";
import { Callout } from "@/ui/Callout";
import { Grid } from "@/ui/Grid";
import styles from "./styles.module.css";

export function BillingUsage({
	className,
	...props
}: Omit<ComponentProps<"div">, "children">) {
	const { dateTimeFormatter } = use(FormatterContext);
	const { data: quota } = trpc.billing.ocrQuotaState.useQuery();
	const { data: slots } = trpc.billing.usage.useQuery();
	const { data: config } = trpc.billing.config.useQuery();

	return (
		<Grid
			{...props}
			gap={6}
			alignItems="start"
			className={clsx(className, styles.usage)}
		>
			<UsageCard
				icon="camera"
				label="Photo-to-Recipe"
				overline="Scans this month"
				used={quota?.used}
				limit={quota?.limit}
				footer={
					quota?.nextAvailableAt ? (
						<Callout size={1} color="amber" heading="Out for this month">
							Your quota resets{" "}
							{dateTimeFormatter.format(new Date(quota.nextAvailableAt))}.
						</Callout>
					) : undefined
				}
			/>

			<UsageCard
				icon="duotone-martini-glass"
				label="Recipe slots"
				overline="Used slots"
				used={slots?.used}
				limit={slots?.limit}
				footer={
					config === undefined || config.slotPacks.length ? (
						<SlotTopUp />
					) : undefined
				}
			/>
		</Grid>
	);
}
