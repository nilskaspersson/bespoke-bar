"use client";

import clsx from "clsx";
import { type ChangeEvent, type KeyboardEvent, useId, useState } from "react";
import z from "zod";
import { Button } from "@/ui/Button";
import { ControlLabel } from "@/ui/ControlLabel";
import formControlStyles from "@/ui/FormControl/styles.module.css";
import { Icon } from "@/ui/Icon";
import { handleKey } from "@/utils/keyboard";
import styles from "./styles.module.css";

const MAX = 1_000_000_000;
const PAGE_STEP_MULTIPLIER = 10;

export function SelectServings({
	value,
	onChange,
	commonValues,
	name = "servings",
	min = 1,
	max = MAX,
	step = 1,
	className,
}: {
	value: number;
	onChange: (servings: number) => void;
	commonValues?: number[];
	name?: string;
	min?: number;
	max?: number;
	step?: number;
	className?: string;
}) {
	const servingsId = useId();
	const [draft, setDraft] = useState<string | null>(null);

	const clamp = (v: number) => Math.min(Math.max(v, min), max);
	const commit = (next: number) => {
		setDraft(null);
		onChange(clamp(next));
	};
	const decrement = () => commit(value - step);
	const increment = () => commit(value + step);
	const pageDecrement = () => commit(value - step * PAGE_STEP_MULTIPLIER);
	const pageIncrement = () => commit(value + step * PAGE_STEP_MULTIPLIER);

	/**
	 * Design-tool convention (Figma, Photoshop, DevTools): Shift scales the
	 * step up by 10×, Alt/Option scales it down by 10× for fractional nudges.
	 */
	const arrowStep = (event: KeyboardEvent, direction: 1 | -1) => {
		const multiplier = event.shiftKey
			? PAGE_STEP_MULTIPLIER
			: event.altKey
				? 0.5
				: 1;
		commit(value + direction * step * multiplier);
	};

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		const next = event.target.value;
		setDraft(next);
		const parsed = z.coerce.number().min(min).max(max).safeParse(next);
		if (parsed.success) onChange(parsed.data);
	};

	return (
		<div className={clsx(className, styles.root)}>
			<ControlLabel label="Servings" htmlFor={servingsId}>
				<div
					className={clsx(
						styles.spinner,
						formControlStyles.control,
						formControlStyles.rounded,
						formControlStyles.fullWidth,
					)}
				>
					<Button
						variant="ghost"
						color="light"
						icon
						onClick={decrement}
						disabled={value <= min}
						aria-label="Decrement servings"
					>
						<Icon name="minus" />
					</Button>

					<input
						id={servingsId}
						name={name}
						type="text"
						inputMode="decimal"
						className={clsx(styles.input, formControlStyles.reset)}
						value={draft ?? String(value)}
						role="spinbutton"
						aria-valuemin={min}
						aria-valuemax={max}
						aria-valuenow={value}
						onFocus={(event) => event.currentTarget.select()}
						onBlur={() => setDraft(null)}
						onChange={handleChange}
						onKeyDown={handleKey([
							["ArrowUp", (event) => arrowStep(event, 1)],
							["ArrowDown", (event) => arrowStep(event, -1)],
							["PageUp", pageIncrement],
							["PageDown", pageDecrement],
						])}
					/>

					<Button
						variant="ghost"
						color="light"
						icon
						onClick={increment}
						disabled={value >= max}
						aria-label="Increment servings"
					>
						<Icon name="plus" />
					</Button>
				</div>
			</ControlLabel>

			{commonValues?.length ? (
				<fieldset className={styles.commonValues} aria-label="Common values">
					{commonValues.map((v) => {
						const isCurrent = value === v;

						return (
							<Button
								key={v}
								size="tiny"
								icon
								variant={isCurrent ? "solid" : "outline"}
								color={isCurrent ? "heavy" : "light"}
								aria-pressed={isCurrent}
								onClick={() => onChange(v)}
								className={clsx({ [styles.quickAction]: !isCurrent })}
							>
								{v}
							</Button>
						);
					})}
				</fieldset>
			) : null}
		</div>
	);
}
