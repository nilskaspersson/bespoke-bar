"use client";

import type { ComponentProps, PropsWithChildren } from "react";
import { useConfirmSubmit } from "@/hooks/useConfirmSubmit";
import { useDialog } from "@/hooks/useDialog";
import { useGracePeriod } from "@/hooks/useGracePeriod";
import { Alert } from "@/ui/Alert";
import { Button, type ButtonProps } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import type { IconName } from "@/ui/Icon/types";
import { SubmitButton } from "@/ui/SubmitButton";

export function ConfirmAction({
	action,
	actionLabel,
	children,
	className,
	buttonProps,
	...props
}: PropsWithChildren<{
	action: () => Promise<void>;
	actionLabel: string;
	className?: string;
	notice?: React.ReactNode;
	description: React.ReactNode;
	iconName?: IconName;
	buttonProps?: ButtonProps;
}>) {
	const {
		isPending,
		confirmSubmit,
		resolveAction,
		rejectAction,
		isSubmitting,
	} = useConfirmSubmit(action);

	const { dialogRef } = useDialog();

	return (
		<>
			<form
				className={className}
				onSubmit={(e) => {
					confirmSubmit(e);
					dialogRef.current?.showModal();
				}}
			>
				<SubmitButton variant="outline" size="small" {...buttonProps}>
					{children}
				</SubmitButton>
			</form>

			<ConfirmAction.Alert
				{...props}
				ref={dialogRef}
				isOpen={isPending}
				onClose={rejectAction}
				heading={actionLabel}
				buttonProps={buttonProps}
				resolveAction={resolveAction}
				isSubmitting={isSubmitting}
			/>
		</>
	);
}

ConfirmAction.Alert = function ConfirmActionAlert({
	acceptLabel,
	description,
	iconName,
	buttonProps,
	resolveAction,
	isSubmitting,
	...props
}: {
	acceptLabel?: string;
	description: React.ReactNode;
	iconName?: IconName;
	buttonProps?: ButtonProps;
	resolveAction?: () => void;
	isSubmitting?: boolean;
} & Omit<ComponentProps<typeof Alert>, "actions" | "children">) {
	return (
		<Alert
			color={buttonProps?.color}
			{...props}
			actions={
				<>
					<form method="dialog">
						<Button type="submit" autoFocus size="small" variant="ghost">
							Cancel
						</Button>
					</form>

					<ConfirmButton
						{...buttonProps}
						onClick={buttonProps?.["aria-disabled"] ? undefined : resolveAction}
						aria-disabled={buttonProps?.["aria-disabled"]}
						disabled={isSubmitting}
						variant="solid"
						size="small"
					>
						{iconName ? <Icon name={iconName} /> : null}
						{acceptLabel ?? props.heading}
					</ConfirmButton>
				</>
			}
		>
			{description}
		</Alert>
	);
};

function ConfirmButton({ children, ...props }: ButtonProps) {
	const isInGracePeriod = useGracePeriod(1000);

	return (
		<Button
			{...props}
			disabled={props.disabled || isInGracePeriod}
			aria-disabled={props["aria-disabled"] || isInGracePeriod}
		>
			{children}
		</Button>
	);
}
