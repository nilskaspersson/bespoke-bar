import { z } from "zod";

const slotPackSchema = z.object({
	priceId: z
		.string()
		.startsWith("price_", 'expected a Price id ("price_…"), not a Product id'),
	slotAmount: z.number().int().positive(),
});

export type SlotPack = z.infer<typeof slotPackSchema>;

export function getSlotPacks(): SlotPack[] {
	const raw = process.env.STRIPE_SLOT_PACK_PRICE_IDS;
	if (!raw) {
		return [];
	}

	const packs = raw
		.split(",")
		.map((pair) => pair.trim())
		.filter(Boolean)
		.map((pair) => {
			const [priceId, slotAmount] = pair.split(":");
			const parsed = slotPackSchema.safeParse({
				priceId: priceId?.trim(),
				slotAmount: Number(slotAmount),
			});

			if (!parsed.success) {
				throw new Error(
					`Malformed STRIPE_SLOT_PACK_PRICE_IDS entry "${pair}" (${z.prettifyError(parsed.error)}) — expected comma-separated "priceId:slotAmount" pairs, e.g. "price_abc:25,price_def:100"`,
				);
			}

			return parsed.data;
		});

	const duplicate = packs.find(
		(pack, i) => packs.findIndex((p) => p.priceId === pack.priceId) !== i,
	);
	if (duplicate) {
		throw new Error(
			`Duplicate price id "${duplicate.priceId}" in STRIPE_SLOT_PACK_PRICE_IDS — findSlotPack would silently resolve only the first, so each price must appear once`,
		);
	}

	return packs;
}

export function findSlotPack(priceId: string): SlotPack | undefined {
	return getSlotPacks().find((pack) => pack.priceId === priceId);
}
