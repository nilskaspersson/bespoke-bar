import { db } from "@bespoke/db";
import { isEmpty } from "@bespoke/domain/utils/collection";
import type { CocktailStyle } from "@bespoke/schema/schema/cocktailStyles";
import { RecipesTable } from "@bespoke/schema/schema/recipes";
import { type AnyColumn, and, eq, inArray, type SQL, sql } from "drizzle-orm";
import { cacheEvents } from "../cache";
import { reserveEnrichmentBudget } from "../enrichmentQuota";
import {
	getRecipeMetaDataBatchWithLLM,
	type RecipeMeta,
} from "./getRecipeMetaDataWithLLM";
import {
	matchShapeWithStyle,
	STYLE_CONFIDENCE_THRESHOLD,
} from "./matchShapeWithStyle/index";
import {
	planRecipeEnrichment,
	type RecipeEnrichmentPlan,
} from "./planRecipeEnrichment";
import type { RecipeEnrichableField } from "./utils/aiEnrichedFields";

const MAX_RECIPE_ENRICHMENT_BATCH_SIZE = 50;

const TRACE_ENABLED = process.env.NODE_ENV === "development";

type EnrichableRecipe = Awaited<
	ReturnType<typeof loadEnrichableRecipes>
>[number];

type Deferred = {
	recipe: EnrichableRecipe;
	match: ReturnType<typeof matchShapeWithStyle>;
};

type PendingUpdate = { id: string; plan: RecipeEnrichmentPlan };

/** One recipe's enrichment decision, for dev insight. */
type EnrichmentTrace = {
	recipeId: string;
	name: string | null;
	path: "style-set" | "trusted" | "llm";
	heuristicStyle?: CocktailStyle | null;
	confidence?: number;
	rule?: string | null;
	llmStyle?: CocktailStyle | null;
	resolvedStyle: CocktailStyle | null;
	written: RecipeEnrichmentPlan | null;
};

/**
 * Best-effort, fire-and-forget enrichment of freshly created recipes.
 * @returns the number of recipes actually updated
 */
export async function enrichRecipes(
	orgId: string,
	recipeIds: string[],
): Promise<number> {
	if (process.env.DISABLE_RECIPE_ENRICHMENT === "true") {
		return 0;
	}

	const recipes = await loadEnrichableRecipes(orgId, recipeIds);
	if (recipes.length === 0) {
		return 0;
	}

	const { resolvedStyleById, deferred, traces } = classifyByShape(recipes);
	const { llmServeById, budgetDenied } = await resolveDeferredWithLLM(
		orgId,
		deferred,
		resolvedStyleById,
		traces,
	);

	const pending = planUpdates(recipes, resolvedStyleById, llmServeById, traces);

	if (pending.length > 0) {
		await writeEnrichment(orgId, pending);

		// Emit after the single write lands, so one throwing emit (e.g. updateTag
		// off the Server Action path) can't abort the others or undo the UPDATE.
		for (const { id } of pending) {
			cacheEvents.recipe.update.emit(orgId, id);
		}
	}

	if (TRACE_ENABLED) {
		logEnrichmentTrace(
			orgId,
			[...traces.values()],
			pending.length,
			budgetDenied,
		);
	}

	return pending.length;
}

/** Load the batch scoped to the org, keeping only recipes still missing a serve field. */
async function loadEnrichableRecipes(orgId: string, recipeIds: string[]) {
	const ids = recipeIds.slice(0, MAX_RECIPE_ENRICHMENT_BATCH_SIZE);
	if (ids.length === 0) {
		return [];
	}

	const recipes = await db.query.RecipesTable.findMany({
		where: and(inArray(RecipesTable.id, ids), eq(RecipesTable.orgId, orgId)),
		with: { lines: { with: { ingredient: true } } },
	});

	return recipes.filter(
		(recipe) =>
			isEmpty(recipe.style) ||
			isEmpty(recipe.glassware) ||
			isEmpty(recipe.ice) ||
			isEmpty(recipe.preparationMethod),
	);
}

/**
 * Resolve each recipe's style from its shape: a user-set style is kept, a
 * high-confidence heuristic is trusted, and everything else is deferred to the
 * LLM with the heuristic guess as a tentative baseline.
 */
function classifyByShape(recipes: EnrichableRecipe[]) {
	const resolvedStyleById = new Map<string, CocktailStyle | null>();
	const deferred: Deferred[] = [];
	const traces = new Map<string, EnrichmentTrace>();

	for (const recipe of recipes) {
		// Style already set → no resolution; keeps the LLM off serve-only gaps.
		if (!isEmpty(recipe.style)) {
			traces.set(recipe.id, {
				recipeId: recipe.id,
				name: recipe.name,
				path: "style-set",
				resolvedStyle: recipe.style,
				written: null,
			});
			continue;
		}

		const match = matchShapeWithStyle(recipe);
		const trusted =
			match.style != null && match.confidence >= STYLE_CONFIDENCE_THRESHOLD;

		// Baseline = the heuristic guess; the LLM refines it later if budget allows.
		resolvedStyleById.set(recipe.id, match.style);
		if (!trusted) {
			deferred.push({ recipe, match });
		}

		traces.set(recipe.id, {
			recipeId: recipe.id,
			name: recipe.name,
			path: trusted ? "trusted" : "llm",
			heuristicStyle: match.style,
			confidence: match.confidence,
			rule: match.rule,
			resolvedStyle: match.style,
			written: null,
		});
	}

	return { resolvedStyleById, deferred, traces };
}

/** Core (non-optional) lines as name + amount — the ground-truth build for the LLM. */
function coreLines(recipe: EnrichableRecipe) {
	return (recipe.lines ?? [])
		.filter((line) => !line.optional)
		.map((line) => ({
			name: line.ingredient?.name ?? null,
			quantity: line.quantity,
			unit: line.unit,
		}));
}

/**
 * The only paid step, gated by the per-org quota. For each deferred recipe, upgrade
 * the resolved style with the LLM's verdict and capture its serve fields — but a
 * null/"other" verdict is an abstain, leaving the tentative baseline in place.
 */
async function resolveDeferredWithLLM(
	orgId: string,
	deferred: Deferred[],
	resolvedStyleById: Map<string, CocktailStyle | null>,
	traces: Map<string, EnrichmentTrace>,
): Promise<{ llmServeById: Map<string, RecipeMeta>; budgetDenied: boolean }> {
	const llmServeById = new Map<string, RecipeMeta>();

	if (deferred.length === 0) {
		return { llmServeById, budgetDenied: false };
	}

	if (!(await reserveEnrichmentBudget(orgId, deferred.length))) {
		return { llmServeById, budgetDenied: true };
	}

	const llmResults = await getRecipeMetaDataBatchWithLLM(
		deferred.map(({ recipe, match }) => ({
			id: recipe.id,
			name: recipe.name,
			ingredients: coreLines(recipe),
			tentativeStyle: match.style,
		})),
	);

	for (const { recipe, match } of deferred) {
		const meta = llmResults.get(recipe.id);
		const resolved = meta?.style ?? match.style;
		resolvedStyleById.set(recipe.id, resolved);

		// When the LLM resolved a real style, trust its serve too. An "other"
		// verdict is an abstain — don't guess the serve from it.
		if (meta?.style && meta.style !== "other") {
			llmServeById.set(recipe.id, meta);
		}

		const trace = traces.get(recipe.id);
		if (trace) {
			trace.llmStyle = meta?.style ?? null;
			trace.resolvedStyle = resolved;
		}
	}

	return { llmServeById, budgetDenied: false };
}

/** Compute each recipe's fill plan, dropping recipes that need no change. */
function planUpdates(
	recipes: EnrichableRecipe[],
	resolvedStyleById: Map<string, CocktailStyle | null>,
	llmServeById: Map<string, RecipeMeta>,
	traces: Map<string, EnrichmentTrace>,
): PendingUpdate[] {
	const pending: PendingUpdate[] = [];

	for (const recipe of recipes) {
		const plan = planRecipeEnrichment(
			recipe,
			resolvedStyleById.get(recipe.id) ?? null,
			llmServeById.get(recipe.id),
		);

		const trace = traces.get(recipe.id);
		if (trace) {
			trace.written = plan;
		}

		if (plan) {
			pending.push({ id: recipe.id, plan });
		}
	}

	return pending;
}

/** Enum columns enrichment can fill, with their Postgres cast. */
const ENUM_COLUMNS = [
	{ key: "style", column: RecipesTable.style, cast: "cocktail_styles" },
	{ key: "glassware", column: RecipesTable.glassware, cast: "glassware" },
	{ key: "ice", column: RecipesTable.ice, cast: "ice" },
	{
		key: "preparationMethod",
		column: RecipesTable.preparationMethod,
		cast: "preparation_method",
	},
] as const;

/**
 * One batch UPDATE for the whole set: each column is a per-row CASE, so different
 * recipes receive different values from a single statement.
 */
async function writeEnrichment(
	orgId: string,
	pending: PendingUpdate[],
): Promise<void> {
	const set: Record<string, SQL> = { aiEnrichedFields: aiMarksCase(pending) };

	for (const { key, column, cast } of ENUM_COLUMNS) {
		const expr = coalescedFillCase(column, pending, key, cast);
		if (expr) {
			set[key] = expr;
		}
	}

	await db
		.update(RecipesTable)
		.set(set)
		.where(
			and(
				inArray(
					RecipesTable.id,
					pending.map(({ id }) => id),
				),
				eq(RecipesTable.orgId, orgId),
			),
		);
}

/**
 * `coalesce(column, case when id = … then value::cast … end)`, or undefined when no
 * row fills this column. COALESCE keeps a value the user set concurrently; a row
 * with no arm falls through to NULL, which COALESCE then no-ops.
 */
function coalescedFillCase(
	column: AnyColumn,
	pending: PendingUpdate[],
	key: RecipeEnrichableField,
	cast: string,
): SQL | undefined {
	const arms = pending.flatMap(({ id, plan }) => {
		const value = plan[key];
		return value === undefined
			? []
			: [sql`when ${RecipesTable.id} = ${id} then ${value}::${sql.raw(cast)}`];
	});

	if (arms.length === 0) {
		return undefined;
	}

	return sql`coalesce(${column}, case ${sql.join(arms, sql` `)} end)`;
}

/** `case when id = … then ARRAY[…]::text[] … end` — every pending row sets its marks. */
function aiMarksCase(pending: PendingUpdate[]): SQL {
	const arms = pending.map(({ id, plan }) => {
		const marks = sql.join(
			plan.aiEnrichedFields.map((mark) => sql`${mark}`),
			sql`, `,
		);
		return sql`when ${RecipesTable.id} = ${id} then ARRAY[${marks}]::text[]`;
	});

	return sql`case ${sql.join(arms, sql` `)} end`;
}

/** Emits one line per recipe + a batch summary. Dev-only; see {@link TRACE_ENABLED}. */
function logEnrichmentTrace(
	orgId: string,
	traces: EnrichmentTrace[],
	updated: number,
	budgetDenied: boolean,
): void {
	for (const trace of traces) {
		console.info("[recipe-enrichment]", JSON.stringify(trace));
	}

	console.info(
		"[recipe-enrichment] batch",
		JSON.stringify({
			orgId,
			total: traces.length,
			styleSet: traces.filter((t) => t.path === "style-set").length,
			trusted: traces.filter((t) => t.path === "trusted").length,
			llm: traces.filter((t) => t.path === "llm").length,
			budgetDenied,
			updated,
		}),
	);
}
