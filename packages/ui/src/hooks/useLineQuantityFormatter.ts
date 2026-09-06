"use client";

import { use, useCallback, useRef } from "react";
import { FormatterContext } from "../hooks/useFormatter";

export function useLineQuantityFormatter() {
	const { quantityFormatter, options } = use(FormatterContext);
	const formattersRef = useRef(new Map<number, Intl.NumberFormat>());

	return useCallback(
		(v: number, precision?: number) => {
			if (precision == null) return quantityFormatter.format(v);

			let fmt = formattersRef.current.get(precision);
			if (!fmt) {
				fmt = new Intl.NumberFormat(options.locale, {
					minimumFractionDigits: precision,
					maximumFractionDigits: precision,
				});
				formattersRef.current.set(precision, fmt);
			}

			return fmt.format(v);
		},
		[quantityFormatter, options.locale],
	);
}
