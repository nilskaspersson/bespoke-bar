import { readFileSync, writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
	type Contract,
	diffContract,
	serializeContract,
} from "./serializeContract";

const BASELINE_URL = new URL("./mobile-contract.json", import.meta.url);

/**
 * Importing `appRouter` transitively imports `@bespoke/db`, which throws at
 * module scope without `DATABASE_URL`, and `genai`, which throws without a GCP
 * project. Stub both before the dynamic import — nothing connects (the pg pool
 * and the Vertex client are both lazy).
 */
async function serializeLiveContract(): Promise<Contract> {
	process.env.DATABASE_URL ??= "postgres://contract-snapshot";
	process.env.GCP_PROJECT_ID ??= "contract-snapshot";
	const { appRouter } = await import("../trpc/routers/_app");
	return serializeContract(appRouter);
}

describe("mobile contract additivity", () => {
	it("stays additive against the committed baseline", async () => {
		const current = await serializeLiveContract();

		if (process.env.CONTRACT_UPDATE) {
			writeFileSync(BASELINE_URL, `${JSON.stringify(current, null, "\t")}\n`);
			return;
		}

		const baseline = JSON.parse(readFileSync(BASELINE_URL, "utf8")) as Contract;

		const violations = diffContract(baseline, current);
		expect(violations, violations.join("\n")).toEqual([]);
	});
});
