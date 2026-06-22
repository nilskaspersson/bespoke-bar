"use client";

import type { AdminSubscriptionSummary } from "@bespoke/api/admin/getAdminOrgDetails";
import { Button } from "@bespoke/ui/Button";
import { Chip } from "@bespoke/ui/Chip";
import { Flex } from "@bespoke/ui/Flex";
import { Grid } from "@bespoke/ui/Grid";
import { FormatterContext } from "@bespoke/ui/hooks/useFormatter";
import { SubmitButton } from "@bespoke/ui/SubmitButton";
import { Text } from "@bespoke/ui/Text";
import { TextField } from "@bespoke/ui/TextField";
import { toast } from "@bespoke/ui/Toast";
import { use } from "react";
import { grantProManual } from "@/features/admin/api/grantProManual";
import { revokeProManual } from "@/features/admin/api/revokeProManual";

type Props = {
	orgId: string;
	subscription: AdminSubscriptionSummary | null | undefined;
	onSuccess?: () => void;
};

function defaultExpiry(): string {
	const date = new Date();
	date.setUTCFullYear(date.getUTCFullYear() + 1);
	return date.toISOString().slice(0, 10);
}

export function AssignProForm({ orgId, subscription, onSuccess }: Props) {
	const { dateTimeFormatter } = use(FormatterContext);

	const isPro = subscription?.isPro ?? false;

	async function assign(formData: FormData) {
		const expiresAt = String(formData.get("expiresAt") ?? "");

		const promise = grantProManual({ orgId, expiresAt });

		toast.promise(promise, {
			loading: "Assigning Pro…",
			success: () => ({ message: "Pro assigned" }),
			error: (err) => ({
				message: "Could not assign Pro",
				description: err instanceof Error ? err.message : "Try again later.",
			}),
		});

		try {
			await promise;
			onSuccess?.();
		} catch {
			// Handled by toast.promise
		}
	}

	async function revoke() {
		const promise = revokeProManual({ orgId });

		toast.promise(promise, {
			loading: "Revoking Pro…",
			success: () => ({ message: "Pro revoked" }),
			error: (err) => ({
				message: "Could not revoke Pro",
				description: err instanceof Error ? err.message : "Try again later.",
			}),
		});

		try {
			await promise;
			onSuccess?.();
		} catch {
			// Handled by toast.promise
		}
	}

	return (
		<Grid gap={5}>
			<Flex gap={2} alignItems="center">
				{isPro ? (
					<Chip color="accent">Pro</Chip>
				) : (
					<Chip color="light" variant="outline">
						Free
					</Chip>
				)}

				{subscription ? (
					<Text size={2} light>
						{isPro ? "Active until" : `${subscription.status} ·`}{" "}
						{dateTimeFormatter.format(new Date(subscription.currentPeriodEnd))}
					</Text>
				) : null}
			</Flex>

			<form action={assign}>
				<Grid gap={5}>
					<TextField
						type="date"
						label="Pro until"
						name="expiresAt"
						required
						defaultValue={defaultExpiry()}
						helperText="Shown as the period end. Pro stays active until revoked."
					/>

					<Flex gap={3} wrap>
						<SubmitButton variant="solid" color="accent">
							{isPro ? "Update Pro" : "Assign Pro"}
						</SubmitButton>

						{isPro ? (
							<Button variant="outline" color="red" onClick={revoke}>
								Revoke Pro
							</Button>
						) : null}
					</Flex>
				</Grid>
			</form>
		</Grid>
	);
}
