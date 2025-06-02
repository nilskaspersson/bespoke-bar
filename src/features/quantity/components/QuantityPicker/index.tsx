"use client";

import {
	type FormEventHandler,
	useCallback,
	useId,
	useRef,
	useState,
} from "react";
import { type Spec, specsInsertSchema } from "@/db/schema/specs";
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

	const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
		(event) => {
			event.preventDefault();
			const formData = new FormData(event.currentTarget);
			const parsedQuantity = specsInsertSchema.shape.quantity.safeParse(
				formData.get("quantity"),
			);

			if (parsedQuantity.success) {
				onChange(parsedQuantity.data);
			} else {
				event.stopPropagation();
			}
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
				<form onSubmit={handleSubmit}>
					<input
						type="text"
						inputMode="decimal"
						name="quantity"
						value={value}
						onChange={(event) => setValue(event.target.value)}
						onBlur={() => handleChange(value)}
					/>
				</form>
			</Popover>
		</div>
	);
}
