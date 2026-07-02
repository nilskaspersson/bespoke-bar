"use client";

import { AnimatedNumber } from "@bespoke/ui/AnimatedNumber";
import { Chip } from "@bespoke/ui/Chip";
import { FormatterContext } from "@bespoke/ui/hooks/useFormatter";
import { Text } from "@bespoke/ui/Text";
import { use } from "react";
import { trpc } from "@/trpc/client";

export function OCRQuotaIndicator({ locked }: { locked?: boolean }) {
	const { relativeTimeFormatter } = use(FormatterContext);
	const { data } = trpc.billing.ocrQuotaState.useQuery(undefined, {
		refetchOnMount: "always",
	});

	if (!data) {
		return null;
	}

	return (
		<Chip
			size={1}
			variant="outline"
			color={locked && data.remaining === 0 ? "red" : "amber"}
			title={
				data.nextAvailableAt
					? `Unlocks ${formatNextAvailable(data.nextAvailableAt, relativeTimeFormatter)}`
					: undefined
			}
		>
			This month: <AnimatedNumber value={data.used} /> /{" "}
			<Text numeric weight={600}>
				{data.limit}
			</Text>
		</Chip>
	);
}

function formatNextAvailable(
	nextAvailableAt: string,
	relativeTimeFormatter: Intl.RelativeTimeFormat,
): string {
	const seconds = Math.max(
		0,
		Math.ceil((new Date(nextAvailableAt).getTime() - Date.now()) / 1000),
	);

	if (seconds < 60) {
		return relativeTimeFormatter.format(Math.max(1, seconds), "second");
	}
	if (seconds < 3600) {
		return relativeTimeFormatter.format(Math.round(seconds / 60), "minute");
	}
	if (seconds < 86400) {
		return relativeTimeFormatter.format(Math.round(seconds / 3600), "hour");
	}
	return relativeTimeFormatter.format(Math.round(seconds / 86400), "day");
}
