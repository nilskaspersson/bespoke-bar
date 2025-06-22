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

export const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
	year: "numeric",
	month: "short",
	day: "numeric",
});

export const relativeTimeFormatter = new Intl.RelativeTimeFormat("en-GB", {
	numeric: "auto",
	style: "long",
});
