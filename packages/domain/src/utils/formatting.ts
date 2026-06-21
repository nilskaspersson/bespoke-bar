export function createPercentageFormatter(language: string) {
	return new Intl.NumberFormat(language, {
		style: "percent",
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	});
}

export function createVolumeFormatter(language: string) {
	return new Intl.NumberFormat(language, {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	});
}

export function createQuantityFormatter(language: string) {
	return new Intl.NumberFormat(language, {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	});
}

export function createCurrencyFormatter(language: string, currency: string) {
	return new Intl.NumberFormat(language, {
		style: "currency",
		currency,
		currencyDisplay: "narrowSymbol",
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	});
}

export function createCurrencyDisplayName(language: string) {
	return new Intl.DisplayNames(language, { type: "currency" });
}

export function createDateTimeFormatter(language: string) {
	return new Intl.DateTimeFormat(language, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

export function createRelativeTimeFormatter(language: string) {
	return new Intl.RelativeTimeFormat(language, {
		numeric: "auto",
		style: "long",
	});
}

export function pluralize(
	count: number,
	singular: string,
	plural = `${singular}s`,
) {
	return count === 1 ? singular : plural;
}
