"use client";

import { useRef } from "react";
import { Grid } from "@/ui/Grid";
import { RadioGroup, type RadioGroupOption } from "@/ui/RadioGroup";
import { SubmitButton } from "@/ui/SubmitButton";
import { TextField } from "@/ui/TextField";
import { toast } from "@/ui/Toast";
import { pluralize } from "@/utils/formatting";
import type { Keyed } from "@/utils/withKey";

type GrantInput = {
	orgId: string;
	amount: number;
	source: string;
	note?: string;
};

type Props = {
	orgId: string;
	action: (input: GrantInput) => Promise<void>;
	/** Singular noun for the granted resource, e.g. "slot" or "use". */
	unit: string;
	min: number;
	max: number;
	onSuccess?: () => void;
};

const SOURCE_OPTIONS: Keyed<RadioGroupOption>[] = [
	{ id: "manual", label: "Manual grant", value: "manual" },
	{ id: "refund", label: "Refund", value: "refund" },
];

export function GrantQuotaForm({
	orgId,
	action,
	unit,
	min,
	max,
	onSuccess,
}: Props) {
	const formRef = useRef<HTMLFormElement>(null);

	async function submit(formData: FormData) {
		const amount = Number(formData.get("amount") ?? Number.NaN);
		const source = String(formData.get("source") ?? "manual");
		const note = (formData.get("note") as string) || undefined;

		const promise = action({ orgId, amount, source, note });

		toast.promise(promise, {
			loading: "Granting…",
			success: () => ({
				message:
					amount >= 0
						? `Granted ${pluralize(amount, unit)}`
						: `Removed ${pluralize(Math.abs(amount), unit)}`,
			}),
			error: (err) => ({
				message: "Could not grant",
				description: err instanceof Error ? err.message : "Try again later.",
			}),
		});

		try {
			await promise;
			formRef.current?.reset();
			onSuccess?.();
		} catch {
			// Handled by toast.promise
		}
	}

	return (
		<form ref={formRef} action={submit}>
			<Grid gap={5}>
				<TextField
					label="Amount"
					name="amount"
					type="number"
					required
					min={min}
					max={max}
				/>
				<RadioGroup
					legend="Source"
					name="source"
					options={SOURCE_OPTIONS}
					defaultValue="manual"
				/>
				<TextField label="Note" name="note" maxLength={1000} />

				<div>
					<SubmitButton variant="solid" color="accent">
						Grant
					</SubmitButton>
				</div>
			</Grid>
		</form>
	);
}
