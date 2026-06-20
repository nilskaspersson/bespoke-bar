"use client";

import { use, useTransition } from "react";
import { createSlotPackCheckout } from "@/features/billing/api/createSlotPackCheckout";
import { formatPrice } from "@/features/billing/formatPrice";
import { navigateToStripe } from "@/features/billing/navigateToStripe";
import { FormatterContext } from "@/hooks/useFormatter";
import { trpc } from "@/trpc/client";
import { Button } from "@/ui/Button";
import { Flex } from "@/ui/Flex";
import { Grid } from "@/ui/Grid";
import { Icon } from "@/ui/Icon";
import { Skeleton } from "@/ui/Skeleton";
import { Text } from "@/ui/Text";

export function SlotTopUp() {
	const { options } = use(FormatterContext);
	const { data: config } = trpc.billing.config.useQuery();
	const [isPending, startTransition] = useTransition();

	const isLoading = config === undefined;
	const packs = config?.slotPacks ?? [];
	if (!isLoading && !packs.length) {
		return null;
	}

	function buyPack(priceId: string) {
		startTransition(() =>
			navigateToStripe(
				createSlotPackCheckout({ priceId }),
				"Opening secure checkout…",
				"Could not start checkout",
			),
		);
	}

	return (
		<Grid as="section" gap={4}>
			<Grid gap={1}>
				<Text heavy weight={600}>
					Increase your slots
				</Text>
				<Text size={1} light>
					Add permanent recipe slots. One-time purchase, no subscription.
				</Text>
			</Grid>

			<Grid gap={2}>
				{isLoading ? <Skeleton width="100%" height="40px" /> : null}

				{packs.map((pack) => {
					const price = formatPrice(pack.price, options.locale);

					return (
						<Button
							key={pack.priceId}
							variant="outline"
							fullWidth
							disabled={isPending}
							onClick={() => buyPack(pack.priceId)}
							endAdornment={
								<Flex gap={2} alignItems="center">
									{price ? <Text weight={700}>{price.amount}</Text> : null}
									<Icon name="arrow-right" />
								</Flex>
							}
						>
							Add +{pack.slotAmount} slots
						</Button>
					);
				})}
			</Grid>
		</Grid>
	);
}
