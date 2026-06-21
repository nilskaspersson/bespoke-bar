import Stripe from "stripe";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { POST } from "@/app/api/webhooks/stripe/route";
import {
	clawBackSlotGrant,
	issueSlotGrant,
} from "@/features/billing/api/issueSlotGrant.service";
import { upsertOrgSubscription } from "@/features/billing/api/upsertOrgSubscription.service";
import { getStripe } from "@/features/billing/stripe";
import { cacheEvents } from "@/utils/cache";
import {
	mirrorFromSubscription,
	proBonusGrantsFromSubscription,
	signupGrantKeyFromRefundedInvoice,
	slotPackGrantFromSession,
} from "./stripeWebhook";

vi.mock("@/features/billing/api/issueSlotGrant.service", () => ({
	issueSlotGrant: vi.fn(),
	clawBackSlotGrant: vi.fn(),
}));

vi.mock("@/features/billing/api/upsertOrgSubscription.service", () => ({
	upsertOrgSubscription: vi.fn(),
}));

const dbMock = vi.hoisted(() => {
	const returning = vi.fn();
	const where = vi.fn(() => ({ returning }));
	const set = vi.fn(() => ({ where }));
	const update = vi.fn(() => ({ set }));
	return { update, set, where, returning };
});

vi.mock("@/db", () => ({ db: { update: dbMock.update } }));

vi.mock("@/utils/cache", () => ({
	cacheEvents: {
		organisation: { update: { emitFromRouteHandler: vi.fn() } },
	},
}));

function paymentSession(
	metadata: Record<string, string> | null,
): Stripe.Checkout.Session {
	return {
		id: "cs_test_123",
		mode: "payment",
		metadata,
	} as unknown as Stripe.Checkout.Session;
}

describe("slotPackGrantFromSession", () => {
	test("maps server-written metadata to a namespaced, idempotent grant", () => {
		const grant = slotPackGrantFromSession(
			paymentSession({ orgId: "org1", slotAmount: "25", createdBy: "user1" }),
		);

		expect(grant).toEqual({
			orgId: "org1",
			amount: 25,
			externalId: "stripe:cs_test_123",
			createdBy: "user1",
		});
	});

	test("a session without our metadata is not ours", () => {
		expect(slotPackGrantFromSession(paymentSession(null))).toBeNull();
		expect(slotPackGrantFromSession(paymentSession({}))).toBeNull();
	});

	test("a non-positive or non-numeric amount never grants", () => {
		for (const slotAmount of ["0", "-5", "2.5", "lots"]) {
			expect(
				slotPackGrantFromSession(paymentSession({ orgId: "org1", slotAmount })),
			).toBeNull();
		}
	});
});

function subscription(
	overrides: Record<string, unknown> = {},
): Stripe.Subscription {
	return {
		id: "sub_123",
		customer: "cus_123",
		status: "active",
		created: Date.UTC(2026, 4, 15) / 1000,
		cancel_at_period_end: false,
		metadata: { orgId: "org1", createdBy: "user1" },
		items: {
			data: [
				{
					price: { id: "price_pro" },
					current_period_end: 1782864000, // 2026-07-01T00:00:00Z
				},
			],
		},
		...overrides,
	} as unknown as Stripe.Subscription;
}

describe("mirrorFromSubscription", () => {
	test("maps the re-fetched subscription onto the mirror row", () => {
		expect(mirrorFromSubscription(subscription())).toEqual({
			orgId: "org1",
			stripeCustomerId: "cus_123",
			stripeSubscriptionId: "sub_123",
			status: "active",
			priceId: "price_pro",
			currentPeriodEnd: "2026-07-01T00:00:00.000Z",
			cancelAtPeriodEnd: false,
			createdBy: "user1",
		});
	});

	test("unwraps an expanded customer object", () => {
		const mirror = mirrorFromSubscription(
			subscription({ customer: { id: "cus_456" } }),
		);

		expect(mirror?.stripeCustomerId).toBe("cus_456");
	});

	test("a subscription our checkout didn't mint maps to null", () => {
		expect(mirrorFromSubscription(subscription({ metadata: {} }))).toBeNull();
		expect(
			mirrorFromSubscription(subscription({ items: { data: [] } })),
		).toBeNull();
		expect(
			mirrorFromSubscription(subscription({ status: "not_a_status" })),
		).toBeNull();
	});
});

describe("proBonusGrantsFromSubscription", () => {
	test("a subscription created this month mints only the signup bonus", () => {
		const grants = proBonusGrantsFromSubscription(
			subscription({ created: Date.UTC(2026, 5, 1) / 1000 }),
			Date.UTC(2026, 5, 11),
		);

		expect(grants).toEqual([
			{
				orgId: "org1",
				amount: 100,
				externalId: "pro-signup:org1",
				note: "Pro first-signup bonus",
				createdBy: "user1",
			},
		]);
	});

	test("a renewal in a later month adds that month's loyalty accrual", () => {
		const grants = proBonusGrantsFromSubscription(
			subscription(),
			Date.UTC(2026, 5, 11),
		);

		expect(grants.map((grant) => grant.externalId)).toEqual([
			"pro-signup:org1",
			"pro-month:2026-06:org1",
		]);
		expect(grants[1]).toMatchObject({ amount: 5, createdBy: "user1" });
	});

	test("the loyalty key rolls the year boundary correctly", () => {
		const grants = proBonusGrantsFromSubscription(
			subscription({ created: Date.UTC(2026, 11, 20) / 1000 }),
			Date.UTC(2027, 0, 20),
		);

		expect(grants[1]?.externalId).toBe("pro-month:2027-01:org1");
	});

	test("same-month redelivery and resubscription mint identical keys (idempotent downstream)", () => {
		const first = proBonusGrantsFromSubscription(
			subscription(),
			Date.UTC(2026, 5, 11),
		);
		const redelivered = proBonusGrantsFromSubscription(
			subscription({ id: "sub_456", created: Date.UTC(2026, 5, 2) / 1000 }),
			Date.UTC(2026, 5, 20),
		);

		expect(redelivered[0]?.externalId).toBe(first[0]?.externalId);
		expect(redelivered).toHaveLength(1);
	});

	test("a subscription that is not active Pro mints nothing", () => {
		for (const status of ["canceled", "past_due", "incomplete", "unpaid"]) {
			expect(
				proBonusGrantsFromSubscription(
					subscription({ status }),
					Date.UTC(2026, 5, 11),
				),
			).toEqual([]);
		}

		expect(
			proBonusGrantsFromSubscription(
				subscription({ metadata: {} }),
				Date.UTC(2026, 5, 11),
			),
		).toEqual([]);
	});
});

function invoice(overrides: Record<string, unknown> = {}): Stripe.Invoice {
	return {
		id: "in_123",
		billing_reason: "subscription_create",
		parent: {
			type: "subscription_details",
			subscription_details: {
				subscription: "sub_123",
				metadata: { orgId: "org1", createdBy: "user1" },
			},
		},
		...overrides,
	} as unknown as Stripe.Invoice;
}

describe("signupGrantKeyFromRefundedInvoice", () => {
	test("a refunded first invoice claws back the org's signup bonus", () => {
		expect(signupGrantKeyFromRefundedInvoice(invoice())).toBe(
			"pro-signup:org1",
		);
	});

	test("refunding a later month is churn, not a clawback", () => {
		expect(
			signupGrantKeyFromRefundedInvoice(
				invoice({ billing_reason: "subscription_cycle" }),
			),
		).toBeNull();
	});

	test("an invoice without our subscription metadata maps to nothing", () => {
		expect(
			signupGrantKeyFromRefundedInvoice(invoice({ parent: null })),
		).toBeNull();
		expect(
			signupGrantKeyFromRefundedInvoice(
				invoice({
					parent: {
						type: "subscription_details",
						subscription_details: { subscription: "sub_123", metadata: {} },
					},
				}),
			),
		).toBeNull();
	});

	test("a deleted invoice maps to nothing", () => {
		expect(
			signupGrantKeyFromRefundedInvoice(
				invoice({ deleted: true }) as unknown as Stripe.DeletedInvoice,
			),
		).toBeNull();
	});
});

const WEBHOOK_SECRET = "whsec_test_secret";

function signedRequest(payload: string, secret = WEBHOOK_SECRET): Request {
	const header = new Stripe("sk_test_dummy").webhooks.generateTestHeaderString({
		payload,
		secret,
	});

	return new Request("http://localhost/api/webhooks/stripe", {
		method: "POST",
		body: payload,
		headers: { "stripe-signature": header },
	});
}

describe("webhook route signature handling", () => {
	let warnSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
	});

	afterEach(() => {
		warnSpy.mockRestore();
		vi.unstubAllEnvs();
	});

	test("rejects an unsigned request", async () => {
		vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_dummy");
		vi.stubEnv("STRIPE_WEBHOOK_SECRET", WEBHOOK_SECRET);

		const res = await POST(
			new Request("http://localhost/api/webhooks/stripe", {
				method: "POST",
				body: "{}",
			}) as never,
		);

		expect(res.status).toBe(401);
	});

	test("rejects a signature minted with the wrong secret", async () => {
		vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_dummy");
		vi.stubEnv("STRIPE_WEBHOOK_SECRET", WEBHOOK_SECRET);

		const payload = JSON.stringify({ id: "evt_1", type: "invoice.paid" });
		const res = await POST(
			signedRequest(payload, "whsec_wrong_secret") as never,
		);

		expect(res.status).toBe(401);
		expect(warnSpy).toHaveBeenCalledOnce();
	});

	test("acknowledges verified events it doesn't handle", async () => {
		vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_dummy");
		vi.stubEnv("STRIPE_WEBHOOK_SECRET", WEBHOOK_SECRET);

		const payload = JSON.stringify({
			id: "evt_1",
			object: "event",
			type: "invoice.paid",
			data: { object: {} },
		});
		const res = await POST(signedRequest(payload) as never);

		expect(res.status).toBe(200);
	});
});

function packSessionEvent(
	type: string,
	paymentStatus: "paid" | "unpaid",
): string {
	return JSON.stringify({
		id: "evt_1",
		object: "event",
		type,
		data: {
			object: {
				id: "cs_test_123",
				mode: "payment",
				payment_status: paymentStatus,
				metadata: { orgId: "org1", slotAmount: "25", createdBy: "user1" },
			},
		},
	});
}

describe("webhook route slot-pack granting", () => {
	afterEach(() => {
		vi.unstubAllEnvs();
		vi.clearAllMocks();
	});

	test("an unpaid (delayed-method) session completes without granting", async () => {
		vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_dummy");
		vi.stubEnv("STRIPE_WEBHOOK_SECRET", WEBHOOK_SECRET);

		const res = await POST(
			signedRequest(
				packSessionEvent("checkout.session.completed", "unpaid"),
			) as never,
		);

		expect(res.status).toBe(200);
		expect(issueSlotGrant).not.toHaveBeenCalled();
	});

	test("a paid session grants the pack", async () => {
		vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_dummy");
		vi.stubEnv("STRIPE_WEBHOOK_SECRET", WEBHOOK_SECRET);

		const res = await POST(
			signedRequest(
				packSessionEvent("checkout.session.completed", "paid"),
			) as never,
		);

		expect(res.status).toBe(200);
		expect(issueSlotGrant).toHaveBeenCalledExactlyOnceWith({
			orgId: "org1",
			amount: 25,
			externalId: "stripe:cs_test_123",
			createdBy: "user1",
			source: "purchase",
			fromRouteHandler: true,
		});
	});

	test("async_payment_succeeded re-enters the same handler once paid", async () => {
		vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_dummy");
		vi.stubEnv("STRIPE_WEBHOOK_SECRET", WEBHOOK_SECRET);

		const res = await POST(
			signedRequest(
				packSessionEvent("checkout.session.async_payment_succeeded", "paid"),
			) as never,
		);

		expect(res.status).toBe(200);
		expect(issueSlotGrant).toHaveBeenCalledOnce();
	});
});

function subscriptionEvent(type: string): string {
	return JSON.stringify({
		id: "evt_1",
		object: "event",
		type,
		data: { object: { id: "sub_123" } },
	});
}

function chargeRefundedEvent(): string {
	return JSON.stringify({
		id: "evt_1",
		object: "event",
		type: "charge.refunded",
		data: { object: { id: "ch_1", refunded: true, payment_intent: "pi_1" } },
	});
}

function disputeEvent(): string {
	return JSON.stringify({
		id: "evt_1",
		object: "event",
		type: "charge.dispute.funds_withdrawn",
		data: { object: { id: "dp_1", payment_intent: "pi_1" } },
	});
}

function subscriptionCheckoutEvent(
	metadata: Record<string, string> | null,
	customer: string,
): string {
	return JSON.stringify({
		id: "evt_1",
		object: "event",
		type: "checkout.session.completed",
		data: {
			object: { id: "cs_sub_1", mode: "subscription", metadata, customer },
		},
	});
}

describe("webhook route subscription + refund routing", () => {
	const stripeSpies: ReturnType<typeof vi.spyOn>[] = [];

	function withStripeEnv() {
		vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_dummy");
		vi.stubEnv("STRIPE_WEBHOOK_SECRET", WEBHOOK_SECRET);
	}

	afterEach(() => {
		for (const spy of stripeSpies.splice(0)) {
			spy.mockRestore();
		}
		vi.unstubAllEnvs();
		vi.clearAllMocks();
	});

	test("a subscription event re-fetches, upserts the mirror, and mints the signup bonus", async () => {
		withStripeEnv();
		stripeSpies.push(
			vi
				.spyOn(getStripe().subscriptions, "retrieve")
				.mockResolvedValue(subscription() as never),
		);

		const res = await POST(
			signedRequest(
				subscriptionEvent("customer.subscription.created"),
			) as never,
		);

		expect(res.status).toBe(200);
		expect(upsertOrgSubscription).toHaveBeenCalledWith(
			expect.objectContaining({
				orgId: "org1",
				status: "active",
				stripeSubscriptionId: "sub_123",
				priceId: "price_pro",
			}),
		);
		expect(issueSlotGrant).toHaveBeenCalledWith(
			expect.objectContaining({
				externalId: "pro-signup:org1",
				source: "bonus_activity",
				fromRouteHandler: true,
			}),
		);
	});

	test("a full charge refund claws back the matching slot-pack grant", async () => {
		withStripeEnv();
		stripeSpies.push(
			vi.spyOn(getStripe().checkout.sessions, "list").mockResolvedValue({
				data: [{ id: "cs_test_123", mode: "payment" }],
			} as never),
		);

		const res = await POST(signedRequest(chargeRefundedEvent()) as never);

		expect(res.status).toBe(200);
		expect(clawBackSlotGrant).toHaveBeenCalledWith(
			expect.objectContaining({
				originalExternalId: "stripe:cs_test_123",
				fromRouteHandler: true,
			}),
		);
	});

	test("a refunded first subscription invoice claws back the signup bonus", async () => {
		withStripeEnv();
		stripeSpies.push(
			vi
				.spyOn(getStripe().checkout.sessions, "list")
				.mockResolvedValue({ data: [] } as never),
			vi.spyOn(getStripe().invoicePayments, "list").mockResolvedValue({
				data: [{ invoice: invoice() }],
			} as never),
		);

		const res = await POST(signedRequest(chargeRefundedEvent()) as never);

		expect(res.status).toBe(200);
		expect(clawBackSlotGrant).toHaveBeenCalledWith(
			expect.objectContaining({ originalExternalId: "pro-signup:org1" }),
		);
	});

	test("a withdrawn dispute reuses the refund clawback path", async () => {
		withStripeEnv();
		stripeSpies.push(
			vi.spyOn(getStripe().checkout.sessions, "list").mockResolvedValue({
				data: [{ id: "cs_test_123", mode: "payment" }],
			} as never),
		);

		const res = await POST(signedRequest(disputeEvent()) as never);

		expect(res.status).toBe(200);
		expect(clawBackSlotGrant).toHaveBeenCalledWith(
			expect.objectContaining({ originalExternalId: "stripe:cs_test_123" }),
		);
	});

	test("a subscription-mode checkout backstops the customer id and busts the cached reader", async () => {
		withStripeEnv();
		dbMock.returning.mockResolvedValue([{ id: "org1" }]);

		const res = await POST(
			signedRequest(
				subscriptionCheckoutEvent({ orgId: "org1" }, "cus_999"),
			) as never,
		);

		expect(res.status).toBe(200);
		expect(dbMock.set).toHaveBeenCalledWith(
			expect.objectContaining({ stripeCustomerId: "cus_999" }),
		);
		expect(
			cacheEvents.organisation.update.emitFromRouteHandler,
		).toHaveBeenCalledWith("org1");
	});

	test("a subscription-mode checkout without metadata writes nothing", async () => {
		withStripeEnv();

		const res = await POST(
			signedRequest(subscriptionCheckoutEvent(null, "cus_999")) as never,
		);

		expect(res.status).toBe(200);
		expect(dbMock.update).not.toHaveBeenCalled();
	});
});
