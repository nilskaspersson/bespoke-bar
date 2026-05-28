/**
 * Live Pro-subscription bonus to the OCR Quota ceiling, computed from
 * subscription state — never stored, so a cancellation propagates immediately.
 * Stubbed at 0 until the Pro tier lands; wired into `getOCRQuotaLimit` from day
 * one so turning it on is a localised change.
 */
export async function getProOCRQuotaBonus(_orgId: string): Promise<number> {
	return 0;
}
