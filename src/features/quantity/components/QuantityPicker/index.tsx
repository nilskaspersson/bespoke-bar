"use client";

import { useCallback, useId, useRef, useState } from "react";
import type { Spec } from "@/db/schema/specs";
import { formatQuantity } from "@/features/quantity/utils/parseQuantity";
import { Popover } from "@/ui/Popover";
import styles from "./styles.module.css";

export function QuantityPicker({
	onChange,
	quantity,
}: {
	onChange: (quantity: Spec["quantity"]) => void;
	quantity: Spec["quantity"] | undefined;
}) {
	const id = useId();
	const anchorRef = useRef<HTMLButtonElement>(null);
	const [value, setValue] = useState<string>(quantity?.toString() ?? "");

	const handleChange = useCallback(
		(quantity: string) => {
			const formattedQuantity = formatQuantity(quantity);

			if (formattedQuantity == null) {
				return null;
			}

			onChange(formattedQuantity);
			setValue(formattedQuantity.toString());
		},
		[onChange],
	);

	if (quantity == null) {
		return null;
	}

	return (
		<div>
			<button
				type="button"
				popoverTarget={id}
				ref={anchorRef}
				className={styles.button}
			>
				{quantity}
			</button>

			<Popover id={id} anchorRef={anchorRef}>
				<input
					type="text"
					inputMode="decimal"
					name="quantity"
					value={value}
					onChange={(event) => setValue(event.target.value)}
					onBlur={() => handleChange(value)}
				/>
			</Popover>
		</div>
	);
}
