"use client";

import { useRef } from "react";
import { grantOCRQuotaManual } from "@/features/billing/api/grantOCRQuotaManual";
import { Grid } from "@/ui/Grid";
import { RadioGroup, type RadioGroupOption } from "@/ui/RadioGroup";
import { SubmitButton } from "@/ui/SubmitButton";
import { TextField } from "@/ui/TextField";
import { toast } from "@/ui/Toast";
import type { Keyed } from "@/utils/withKey";

type Props = {
	defaultOrgId?: string;
};

const SOURCE_OPTIONS: Keyed<RadioGroupOption>[] = [
	{ id: "manual", label: "Manual grant", value: "manual" },
	{ id: "refund", label: "Refund", value: "refund" },
];

export function GrantOCRQuotaForm({ defaultOrgId }: Props) {
	const formRef = useRef<HTMLFormElement>(null);

	async function action(formData: FormData) {
		const orgId = String(formData.get("orgId") ?? "");
		const amount = Number(formData.get("amount") ?? Number.NaN);
		const source = String(formData.get("source") ?? "manual");
		const note = (formData.get("note") as string) || undefined;

		const promise = grantOCRQuotaManual({ orgId, amount, source, note });

		toast.promise(promise, {
			loading: "Granting quota…",
			success: () => ({
				message:
					amount >= 0
						? `Granted ${amount} uses to ${orgId}`
						: `Removed ${Math.abs(amount)} uses from ${orgId}`,
			}),
			error: (err) => ({
				message: "Could not grant quota",
				description: err instanceof Error ? err.message : "Try again later.",
			}),
		});

		try {
			await promise;
			formRef.current?.reset();
		} catch {
			// Handled by toast.promise
		}
	}

	return (
		<form ref={formRef} action={action}>
			<Grid gap={5}>
				<TextField
					label="Org ID"
					name="orgId"
					required
					defaultValue={defaultOrgId}
				/>
				<TextField
					label="Amount"
					name="amount"
					type="number"
					required
					min={-1000}
					max={1000}
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
