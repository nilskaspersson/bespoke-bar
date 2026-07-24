import { describe, expect, it } from "vitest";
import {
	type Contract,
	type ContractInput,
	diffContract,
} from "./serializeContract";

function contract(
	input: ContractInput,
	overrides: Partial<Contract> = {},
): Contract {
	return {
		appErrorCodes: ["ALPHA", "BETA"],
		procedures: { "x.y": { type: "query", input } },
		...overrides,
	};
}

const object = (
	properties: Record<string, unknown>,
	required: string[] = [],
): ContractInput => ({ type: "object", properties, required });

const nullable = (inner: unknown) => ({ anyOf: [inner, { type: "null" }] });
const str = { type: "string" };
const enumOf = (...values: string[]) => ({ type: "string", enum: values });

describe("diffContract — breaking changes fail", () => {
	it("flags a removed procedure", () => {
		const baseline = contract(null);
		const current: Contract = {
			appErrorCodes: ["ALPHA", "BETA"],
			procedures: {},
		};
		expect(diffContract(baseline, current)).toEqual([
			expect.stringContaining("x.y"),
		]);
	});

	it("flags a procedure kind change", () => {
		const baseline = contract(null);
		const current = contract(null);
		current.procedures["x.y"].type = "mutation";
		expect(diffContract(baseline, current)[0]).toContain("type changed");
	});

	it("flags a removed error code", () => {
		const baseline = contract(null);
		const current = contract(null, { appErrorCodes: ["ALPHA"] });
		expect(diffContract(baseline, current)).toEqual([
			expect.stringContaining("BETA"),
		]);
	});

	it("flags a removed property", () => {
		const violations = diffContract(
			contract(object({ a: str, b: str })),
			contract(object({ a: str })),
		);
		expect(violations).toEqual([
			expect.stringContaining("b: property was removed"),
		]);
	});

	it("flags a newly required property", () => {
		const violations = diffContract(
			contract(object({ a: str })),
			contract(object({ a: str }, ["a"])),
		);
		expect(violations[0]).toContain("became required");
	});

	it("flags a top-level enum member removal", () => {
		const violations = diffContract(
			contract(object({ style: enumOf("a", "b", "tiki") })),
			contract(object({ style: enumOf("a", "b") })),
		);
		expect(violations[0]).toContain('"tiki" was removed');
	});

	it("flags an enum member removal inside a nullable field", () => {
		const violations = diffContract(
			contract(object({ style: nullable(enumOf("a", "b", "tiki")) })),
			contract(object({ style: nullable(enumOf("a", "b")) })),
		);
		expect(violations.join("\n")).toContain('"tiki" was removed');
	});

	it("flags a breaking change to an array element", () => {
		const list = (item: unknown) => ({ type: "array", items: item });
		const violations = diffContract(
			contract(
				object({ entries: list(object({ recipeId: str }, ["recipeId"])) }),
			),
			contract(object({ entries: list(object({ menuId: str }, ["menuId"])) })),
		);
		expect(violations.join("\n")).toContain("recipeId: property was removed");
	});

	it("flags a dropped union member (top-level union input)", () => {
		const violations = diffContract(
			contract({ anyOf: [object({ a: str }), { type: "array", items: str }] }),
			contract({ anyOf: [object({ a: str })] }),
		);
		expect(violations[0]).toContain("union dropped member");
	});

	it("flags a field that no longer accepts null", () => {
		const violations = diffContract(
			contract(object({ note: nullable(str) })),
			contract(object({ note: str })),
		);
		expect(violations[0]).toContain("no longer accepts null");
	});

	it("flags a null input promoted to a required scalar", () => {
		const violations = diffContract(contract(null), contract(str));
		expect(violations[0]).toContain("gained a required input");
	});
});

describe("diffContract — additive drift passes", () => {
	it("passes identity", () => {
		const c = contract(object({ a: str, style: nullable(enumOf("a", "b")) }));
		expect(diffContract(c, structuredClone(c))).toEqual([]);
	});

	it("passes a new optional property", () => {
		expect(
			diffContract(
				contract(object({ a: str })),
				contract(object({ a: str, b: str })),
			),
		).toEqual([]);
	});

	it("passes an added enum member", () => {
		expect(
			diffContract(
				contract(object({ style: enumOf("a", "b") })),
				contract(object({ style: enumOf("a", "b", "c") })),
			),
		).toEqual([]);
	});

	it("passes a field becoming nullable", () => {
		expect(
			diffContract(
				contract(object({ note: str })),
				contract(object({ note: nullable(str) })),
			),
		).toEqual([]);
	});

	it("passes a widened union", () => {
		expect(
			diffContract(
				contract({ anyOf: [object({ a: str })] }),
				contract({
					anyOf: [object({ a: str }), { type: "array", items: str }],
				}),
			),
		).toEqual([]);
	});

	it("passes a null input gaining an all-optional object", () => {
		expect(diffContract(contract(null), contract(object({ a: str })))).toEqual(
			[],
		);
	});

	it("passes a newly added procedure and error code", () => {
		const baseline = contract(null);
		const current = contract(null, {
			appErrorCodes: ["ALPHA", "BETA", "GAMMA"],
			procedures: {
				"x.y": { type: "query", input: null },
				"x.z": { type: "mutation", input: object({ a: str }, ["a"]) },
			},
		});
		expect(diffContract(baseline, current)).toEqual([]);
	});
});
