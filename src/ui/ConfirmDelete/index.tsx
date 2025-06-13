"use client";

import type { PropsWithChildren } from "react";
import { useConfirmSubmit } from "@/hooks/useConfirmSubmit";
import { Alert } from "@/ui/Alert";
import { Button } from "@/ui/Button";
import { SubmitButton } from "@/ui/SubmitButton";

export function ConfirmDelete({
	action,
	actionLabel,
	children,
	className,
	description,
	notice,
}: PropsWithChildren<{
	action: () => Promise<void>;
	className?: string;
	actionLabel: string;
	notice: React.ReactNode;
	description: React.ReactNode;
}>) {
	const {
		isPending,
		confirmSubmit,
		resolveAction,
		rejectAction,
		isSubmitting,
	} = useConfirmSubmit(action);

	return (
		<form className={className} onSubmit={confirmSubmit}>
			<SubmitButton>{children}</SubmitButton>

			{isPending ? (
				<Alert
					onClose={rejectAction}
					heading={actionLabel}
					notice={notice}
					actions={
						<>
							<Button onClick={rejectAction} autoFocus>
								Cancel
							</Button>

							<Button onClick={resolveAction} disabled={isSubmitting}>
								{actionLabel}
							</Button>
						</>
					}
				>
					{description}
				</Alert>
			) : null}
		</form>
	);
}
