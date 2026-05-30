import { describe, expect, it } from "vitest";
import { planRecipeEnrichment } from "./planRecipeEnrichment";

const empty = {
	style: null,
	glassware: null,
	ice: null,
	preparationMethod: null,
};

describe("planRecipeEnrichment", () => {
	it("fills style + derived glassware/prep/ice for a fresh recipe", () => {
		expect(planRecipeEnrichment(empty, "sour")).toEqual({
			style: "sour",
			glassware: "coupe",
			preparationMethod: "shaken",
			ice: "none",
			aiEnrichedFields: ["style", "glassware", "preparationMethod", "ice"],
		});
	});

	it("derives serve from the user's style, not the resolved one", () => {
		// User set martini; even if classification says "sour", glass/prep/ice follow
		// the user's martini (martini glass / stirred / no ice), never sour's.
		expect(
			planRecipeEnrichment({ ...empty, style: "martini" }, "sour"),
		).toEqual({
			glassware: "martini",
			preparationMethod: "stirred",
			ice: "none",
			aiEnrichedFields: ["glassware", "preparationMethod", "ice"],
		});
	});

	it("fills serve from the user's style even when the style is unresolved", () => {
		expect(planRecipeEnrichment({ ...empty, style: "highball" }, null)).toEqual(
			{
				glassware: "highball",
				preparationMethod: "built",
				ice: "cubed",
				aiEnrichedFields: ["glassware", "preparationMethod", "ice"],
			},
		);
	});

	it("derives ice from the style, not the glassware", () => {
		// A smash in a rocks glass is still crushed (cf. a Caipirinha) — the glass
		// doesn't dictate ice, the style does.
		expect(
			planRecipeEnrichment({ ...empty, glassware: "rocks" }, "smash"),
		).toEqual({
			style: "smash",
			preparationMethod: "shaken",
			ice: "crushed",
			aiEnrichedFields: ["style", "preparationMethod", "ice"],
		});
	});

	it("fills the still-empty fields when glassware/prep are already set", () => {
		// glass + prep set; ice still derives — from the oldFashioned style.
		expect(
			planRecipeEnrichment(
				{
					style: null,
					glassware: "rocks",
					ice: null,
					preparationMethod: "stirred",
				},
				"oldFashioned",
			),
		).toEqual({
			style: "oldFashioned",
			ice: "cubed",
			aiEnrichedFields: ["style", "ice"],
		});
	});

	it("fills only the style for families without a serve default", () => {
		// `punch` has no STYLE_TO_SERVE entry — style fills, glass/prep/ice stay null.
		expect(planRecipeEnrichment(empty, "punch")).toEqual({
			style: "punch",
			aiEnrichedFields: ["style"],
		});
	});

	it("never auto-writes 'other' (treats it as null)", () => {
		expect(planRecipeEnrichment(empty, "other")).toBeNull();
	});

	it("returns null when the style is unresolved", () => {
		expect(planRecipeEnrichment(empty, null)).toBeNull();
	});

	it("returns null when nothing is left to fill", () => {
		expect(
			planRecipeEnrichment(
				{
					style: "sour",
					glassware: "coupe",
					ice: "none",
					preparationMethod: "shaken",
				},
				"sour",
			),
		).toBeNull();
	});

	it("trusts the LLM's serve over the style default when given", () => {
		// LLM resolved an unusual sour served on the rocks — its serve wins over
		// the sour family default (coupe/none).
		expect(
			planRecipeEnrichment(empty, "sour", {
				glassware: "rocks",
				preparationMethod: "shaken",
				ice: "cubed",
			}),
		).toEqual({
			style: "sour",
			glassware: "rocks",
			preparationMethod: "shaken",
			ice: "cubed",
			aiEnrichedFields: ["style", "glassware", "preparationMethod", "ice"],
		});
	});

	it("falls back to the style map for serve fields the LLM left null", () => {
		expect(
			planRecipeEnrichment(empty, "sour", {
				glassware: null,
				preparationMethod: null,
				ice: "cubed",
			}),
		).toEqual({
			style: "sour",
			glassware: "coupe",
			preparationMethod: "shaken",
			ice: "cubed",
			aiEnrichedFields: ["style", "glassware", "preparationMethod", "ice"],
		});
	});
});
