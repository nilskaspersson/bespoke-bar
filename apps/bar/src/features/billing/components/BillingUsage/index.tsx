"use client";

import { Callout } from "@bespoke/ui/Callout";
import { Grid } from "@bespoke/ui/Grid";
import { FormatterContext } from "@bespoke/ui/hooks/useFormatter";
import { clsx } from "clsx";
import { type ComponentProps, use } from "react";
import { SlotTopUp } from "@/features/billing/components/SlotTopUp";
import { UsageCard } from "@/features/billing/components/UsageCard";
import { RECIPE_SLOTS_BOX_ID } from "@/features/billing/constants";
import { trpc } from "@/trpc/client";
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
				id={RECIPE_SLOTS_BOX_ID}
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
