"use client";

import type { PropsWithChildren } from "react";
import { useConfirmSubmit } from "@/hooks/useConfirmSubmit";
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
	description,
	iconName,
	notice,
	buttonProps,
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

	return (
		<form className={className} onSubmit={confirmSubmit}>
			<SubmitButton variant="outline" size="small" {...buttonProps}>
				{children}
			</SubmitButton>

			{isPending ? (
				<ConfirmAction.Alert
					onClose={rejectAction}
					heading={actionLabel}
					notice={notice}
					description={description}
					iconName={iconName}
					buttonProps={buttonProps}
					resolveAction={resolveAction}
					isSubmitting={isSubmitting}
				/>
			) : null}
		</form>
	);
}

ConfirmAction.Alert = function ConfirmActionAlert({
	onClose,
	heading,
	acceptLabel,
	notice,
	description,
	iconName,
	buttonProps,
	resolveAction,
	isSubmitting,
}: {
	onClose?: () => void;
	heading: string;
	acceptLabel?: string;
	notice?: React.ReactNode;
	description: React.ReactNode;
	iconName?: IconName;
	buttonProps?: ButtonProps;
	resolveAction?: () => void;
	isSubmitting?: boolean;
}) {
	return (
		<Alert
			onClose={onClose}
			heading={heading}
			notice={notice}
			color={buttonProps?.color}
			actions={
				<>
					<Button onClick={onClose} autoFocus size="small" variant="ghost">
						Cancel
					</Button>

					<ConfirmButton
						{...buttonProps}
						onClick={buttonProps?.["aria-disabled"] ? undefined : resolveAction}
						aria-disabled={buttonProps?.["aria-disabled"]}
						disabled={isSubmitting}
						variant="solid"
						size="small"
					>
						{iconName ? <Icon name={iconName} /> : null}
						{acceptLabel ?? heading}
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
