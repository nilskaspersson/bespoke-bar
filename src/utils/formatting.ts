export const collator = new Intl.Collator("en-GB", {
	sensitivity: "base",
	numeric: true,
});

export const percentageFormatter = new Intl.NumberFormat("en-GB", {
	style: "percent",
	minimumFractionDigits: 0,
	maximumFractionDigits: 2,
});

export const volumeFormatter = new Intl.NumberFormat("en-GB", {
	minimumFractionDigits: 0,
	maximumFractionDigits: 1,
});
