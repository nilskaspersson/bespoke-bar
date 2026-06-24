import type { SubscriptionAttention } from "@bespoke/schema/schema/orgSubscriptions";
import { Chip, type ChipProps } from "@bespoke/ui/Chip";
import { Icon } from "@bespoke/ui/Icon";
import type { SystemColor } from "@bespoke/ui/utils/types";

const ATTENTION_LABEL = {
	payment_failed: "Payment failed",
	pending_first_payment: "Payment processing",
} as const;

const getAttentionColor = (
	attention: SubscriptionAttention | null,
): SystemColor => {
	switch (attention) {
		case "payment_failed":
			return "red";
		case "pending_first_payment":
			return "amber";
		default:
			return "heavy";
	}
};

export function BillingStatusBadge({
	attention,
	isPro,
	...props
}: Omit<ChipProps, "children" | "color" | "icon"> & {
	attention: SubscriptionAttention | null;
	isPro: boolean;
}) {
	if (!isPro) {
		return null;
	}

	return (
		<Chip
			color={getAttentionColor(attention)}
			icon={<Icon name={attention ? "circle-exclamation" : "circle-check"} />}
			{...props}
		>
			{attention ? ATTENTION_LABEL[attention] : "Active"}
		</Chip>
	);
}
