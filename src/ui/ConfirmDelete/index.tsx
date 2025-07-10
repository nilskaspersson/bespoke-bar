"use client";

import type { PropsWithChildren } from "react";
import { useConfirmSubmit } from "@/hooks/useConfirmSubmit";
import { Alert } from "@/ui/Alert";
import { Button, type ButtonProps } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import { SubmitButton } from "@/ui/SubmitButton";

export function ConfirmDelete({
	action,
	actionLabel,
	children,
	className,
	description,
	notice,
	...props
}: PropsWithChildren<{
	action: () => Promise<void>;
	className?: string;
	actionLabel: string;
	notice: React.ReactNode;
	description: React.ReactNode;
}> &
	ButtonProps) {
	const {
		isPending,
		confirmSubmit,
		resolveAction,
		rejectAction,
		isSubmitting,
	} = useConfirmSubmit(action);

	return (
		<form className={className} onSubmit={confirmSubmit}>
			<SubmitButton variant="outline" color="red" size="small" {...props}>
				{children}
			</SubmitButton>

			{isPending ? (
				<Alert
					onClose={rejectAction}
					heading={actionLabel}
					notice={notice}
					actions={
						<>
							<Button
								onClick={rejectAction}
								autoFocus
								size="small"
								variant="ghost"
							>
								Cancel
							</Button>

							<Button
								onClick={props["aria-disabled"] ? undefined : resolveAction}
								aria-disabled={props["aria-disabled"]}
								disabled={isSubmitting}
								variant="solid"
								size="small"
								color="red"
							>
								<Icon name="trash" />

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
