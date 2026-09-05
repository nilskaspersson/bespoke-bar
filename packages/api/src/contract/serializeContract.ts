import { appErrorSchema } from "@bespoke/schema/appError";
import { z } from "zod";
import type { AppRouter } from "../trpc/routers/_app";

/**
 * Namespaces the mobile app can never reach — excluded from the contract the
 * same way stage 4 excludes them from dehydration. Everything else counts as
 * mobile-reachable, deliberately conservative: the CRUD procedures exist to
 * back this app even where the first read-only binary doesn't call them yet.
 */
export const MOBILE_UNREACHABLE_NAMESPACES = ["admin"];

export type ContractInput = Record<string, unknown> | null;

export type ContractProcedure = {
	type: "query" | "mutation";
	input: ContractInput;
};

export type Contract = {
	appErrorCodes: string[];
	procedures: Record<string, ContractProcedure>;
};

type ProcedureLike = {
	_def: { type: "query" | "mutation" | "subscription"; inputs: unknown[] };
};

type RouterLike = { _def: { procedures: Record<string, ProcedureLike> } };

function isMobileReachable(path: string): boolean {
	const namespace = path.split(".")[0];
	return !MOBILE_UNREACHABLE_NAMESPACES.includes(namespace);
}

function inputToJSONSchema(inputs: unknown[]): ContractInput {
	if (inputs.length === 0) {
		return null;
	}

	const schema =
		inputs.length === 1
			? (inputs[0] as z.ZodType)
			: (inputs as z.ZodType[]).reduce((a, b) => z.intersection(a, b));

	const { $schema, ...jsonSchema } = z.toJSONSchema(schema, {
		io: "input",
		unrepresentable: "any",
	});

	return jsonSchema;
}

/**
 * Recursively sort object keys so the serialized contract is byte-stable across
 * runs. Arrays keep their order (`required`, `enum`, `appErrorCodes` are sorted
 * by their producers where it matters).
 */
function sortDeep<T>(value: T): T {
	if (Array.isArray(value)) {
		return value.map(sortDeep) as unknown as T;
	}
	if (value && typeof value === "object") {
		const sorted: Record<string, unknown> = {};
		for (const key of Object.keys(value as Record<string, unknown>).sort()) {
			sorted[key] = sortDeep((value as Record<string, unknown>)[key]);
		}
		return sorted as T;
	}
	return value;
}

/**
 * A deterministic, key-sorted snapshot of the mobile-reachable wire contract:
 * procedure paths + kinds + input JSON Schemas, plus the AppError code union.
 * Outputs are inferred Drizzle-row shapes (not declared via `.output()`), so
 * the snapshot deliberately covers paths + inputs + error codes only — output
 * additivity stays a review-time rule (ADR-0009 honest scoping).
 */
export function serializeContract(router: AppRouter): Contract {
	const definitions = (router as unknown as RouterLike)._def.procedures;

	const procedures: Record<string, ContractProcedure> = {};
	for (const path of Object.keys(definitions)) {
		if (!isMobileReachable(path)) {
			continue;
		}
		const def = definitions[path]._def;
		if (def.type === "subscription") {
			continue;
		}
		procedures[path] = {
			type: def.type,
			input: inputToJSONSchema(def.inputs ?? []),
		};
	}

	const appErrorCodes = appErrorSchema.options
		.map((option) => option.shape.code.value)
		.sort();

	return sortDeep({ appErrorCodes, procedures });
}

type JSONSchema = Record<string, unknown>;

function requiredKeys(schema: JSONSchema): string[] {
	return Array.isArray(schema.required) ? (schema.required as string[]) : [];
}

function unionMembers(schema: JSONSchema): JSONSchema[] | null {
	const members = schema.anyOf ?? schema.oneOf;
	return Array.isArray(members) ? (members as JSONSchema[]) : null;
}

function isNullSchema(schema: JSONSchema): boolean {
	return schema?.type === "null";
}

/** zod emits `T | null` as `{ anyOf: [T, { type: "null" }] }`. */
function acceptsNull(schema: JSONSchema): boolean {
	if (schema.type === "null") {
		return true;
	}
	if (Array.isArray(schema.type) && schema.type.includes("null")) {
		return true;
	}
	return unionMembers(schema)?.some(isNullSchema) ?? false;
}

/**
 * Peel the `T | null` wrapper so `T` itself is diffed structurally. Both
 * spellings must be handled: zod <=4.4 emitted `anyOf: [T, { type: "null" }]`,
 * 4.5 emits `type: [T, "null"]`, and a baseline written by either has to diff
 * clean against the other.
 */
function stripNullable(schema: JSONSchema): JSONSchema {
	if (Array.isArray(schema.type)) {
		const nonNull = (schema.type as string[]).filter(
			(member) => member !== "null",
		);
		if (nonNull.length === 1) {
			return { ...schema, type: nonNull[0] };
		}
	}

	const members = unionMembers(schema);
	if (members && members.length === 2) {
		const nonNull = members.filter((member) => !isNullSchema(member));
		if (nonNull.length === 1) {
			return nonNull[0];
		}
	}
	return schema;
}

/**
 * Additive-only diff of one JSON Schema node against its baseline. Reports a
 * violation for anything that could break a shipped binary sending the baseline
 * shape: a removed property, a new/tightened required key, a removed `enum`
 * member, a changed `type`, dropped nullability, a narrowed `anyOf`, or a
 * breaking change to an array's element schema. New optional properties, added
 * enum members, added nullability, and widened unions pass. Assumes union
 * members keep their order across a schema edit (zod emits them in definition
 * order); a deliberate reorder is a baseline-regen event.
 */
function diffSchemaAdditive(
	base: JSONSchema,
	current: JSONSchema,
	path: string,
): string[] {
	const violations: string[] = [];

	if (acceptsNull(base) && !acceptsNull(current)) {
		violations.push(`${path}: no longer accepts null`);
	}

	violations.push(
		...diffNode(stripNullable(base), stripNullable(current), path),
	);
	return violations;
}

function diffNode(
	base: JSONSchema,
	current: JSONSchema,
	path: string,
): string[] {
	const violations: string[] = [];

	const baseMembers = unionMembers(base);
	if (baseMembers) {
		const currentMembers = unionMembers(current);
		if (!currentMembers) {
			violations.push(`${path}: union collapsed to a single schema`);
			return violations;
		}
		if (currentMembers.length < baseMembers.length) {
			violations.push(
				`${path}: union dropped member(s) (${baseMembers.length} → ${currentMembers.length})`,
			);
		}
		const shared = Math.min(baseMembers.length, currentMembers.length);
		for (let i = 0; i < shared; i++) {
			violations.push(
				...diffSchemaAdditive(
					baseMembers[i],
					currentMembers[i],
					`${path}|${i}`,
				),
			);
		}
		return violations;
	}

	if (
		base.type !== undefined &&
		current.type !== undefined &&
		base.type !== current.type
	) {
		violations.push(
			`${path}: type changed from "${base.type}" to "${current.type}"`,
		);
		return violations;
	}

	if (Array.isArray(base.enum)) {
		const currentEnum = new Set(
			Array.isArray(current.enum) ? current.enum : [],
		);
		for (const member of base.enum) {
			if (!currentEnum.has(member)) {
				violations.push(
					`${path}: enum member ${JSON.stringify(member)} was removed`,
				);
			}
		}
	}

	const baseProps = base.properties as Record<string, JSONSchema> | undefined;
	if (baseProps) {
		const currentProps = current.properties as
			| Record<string, JSONSchema>
			| undefined;
		const baseRequired = new Set(requiredKeys(base));

		for (const key of Object.keys(baseProps)) {
			const childPath = `${path}.${key}`;
			if (!currentProps || !(key in currentProps)) {
				violations.push(`${childPath}: property was removed`);
				continue;
			}
			violations.push(
				...diffSchemaAdditive(baseProps[key], currentProps[key], childPath),
			);
		}

		for (const key of requiredKeys(current)) {
			if (!baseRequired.has(key)) {
				violations.push(
					`${path}.${key}: became required (was optional or absent in the baseline)`,
				);
			}
		}
	}

	if (base.type === "array" && base.items && current.items) {
		violations.push(...diffItems(base.items, current.items, path));
	}

	return violations;
}

function diffItems(base: unknown, current: unknown, path: string): string[] {
	if (Array.isArray(base) && Array.isArray(current)) {
		const shared = Math.min(base.length, current.length);
		const violations: string[] = [];
		for (let i = 0; i < shared; i++) {
			violations.push(
				...diffSchemaAdditive(
					base[i] as JSONSchema,
					current[i] as JSONSchema,
					`${path}[${i}]`,
				),
			);
		}
		return violations;
	}
	if (!Array.isArray(base) && !Array.isArray(current)) {
		return diffSchemaAdditive(
			base as JSONSchema,
			current as JSONSchema,
			`${path}[]`,
		);
	}
	return [];
}

/**
 * An input-less baseline procedure may add an input only if a binary sending
 * nothing still validates — i.e. an all-optional object. A scalar, union, array,
 * or object-with-required input rejects the old no-arg call, so it's breaking.
 */
function diffInputAdditive(
	base: ContractInput,
	current: ContractInput,
	path: string,
): string[] {
	if (base === null) {
		if (current === null) {
			return [];
		}
		const omittable =
			current.type === "object" && requiredKeys(current).length === 0;
		return omittable
			? []
			: [`${path}: gained a required input where the baseline had none`];
	}

	if (current === null) {
		return [];
	}

	return diffSchemaAdditive(base, current, path);
}

/**
 * Compare a live contract against a committed baseline under additive-only
 * rules and return every violation (empty = the change is additive). The
 * baseline is *what every binary still in the wild may rely on*, so removals,
 * kind changes, error-code deletions, and narrowed inputs fail; additive drift
 * passes without touching the baseline.
 */
export function diffContract(baseline: Contract, current: Contract): string[] {
	const violations: string[] = [];

	for (const code of baseline.appErrorCodes) {
		if (!current.appErrorCodes.includes(code)) {
			violations.push(`appErrorCodes: "${code}" was removed`);
		}
	}

	for (const path of Object.keys(baseline.procedures)) {
		const baseProc = baseline.procedures[path];
		const currentProc = current.procedures[path];
		if (!currentProc) {
			violations.push(`procedures.${path}: procedure was removed`);
			continue;
		}
		if (currentProc.type !== baseProc.type) {
			violations.push(
				`procedures.${path}: type changed from "${baseProc.type}" to "${currentProc.type}"`,
			);
		}
		violations.push(
			...diffInputAdditive(
				baseProc.input,
				currentProc.input,
				`procedures.${path}.input`,
			),
		);
	}

	return violations;
}
