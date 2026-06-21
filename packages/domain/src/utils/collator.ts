/**
 * TODO: How bring navigator.language here, without obviously re-sorting data?
 */
export const collator = new Intl.Collator("en-GB", {
	sensitivity: "base",
	numeric: true,
});
