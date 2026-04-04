"use client";

import clsx from "clsx";
import { useId } from "react";
import z from "zod";
import { Button } from "@/ui/Button";
import { ControlLabel } from "@/ui/ControlLabel";
import { Flex } from "@/ui/Flex";
import { Input } from "@/ui/Input";
import { times } from "@/utils";
import styles from "./styles.module.css";

export function SelectServings({
	value,
	onChange,
	className,
}: {
	value: number;
	onChange: (servings: number) => void;
	className?: string;
}) {
	const servingsId = useId();

	return (
		<div className={clsx(className, styles.servings)}>
			<ControlLabel label="Servings" htmlFor={servingsId}>
				<Flex gap={1} alignItems="center">
					{times(4).map((i) => (
						<Button
							key={i}
							size="small"
							icon
							variant={value === i + 1 ? "solid" : "outline"}
							color={value === i + 1 ? "heavy" : "light"}
							onClick={() => onChange(i + 1)}
						>
							{i + 1}
						</Button>
					))}

					<div>
						<Input
							name="servings"
							id={servingsId}
							placeholder="5…"
							type="number"
							pill
							min={1}
							max={1000000000}
							onChange={(event) => {
								const parsedValue = z.coerce
									.number()
									.min(1)
									.max(1000000000)
									.safeParse(event.target.value);

								if (parsedValue.success) {
									onChange(parsedValue.data);
								}
							}}
						/>
					</div>
				</Flex>
			</ControlLabel>
		</div>
	);
}
