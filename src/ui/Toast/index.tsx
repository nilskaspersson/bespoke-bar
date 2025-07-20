import { clsx } from "clsx";
import type { ComponentProps } from "react";
import { toast as sonnerToast } from "sonner";
import buttonStyles from "@/ui/Button/styles.module.css";
import styles from "./styles.module.css";

const defaultConfig = {
	unstyled: true,
	classNames: {
		toast: styles.toast,
		icon: styles.icon,
		loader: styles.loader,
		closeButton: clsx(styles.closeButton, buttonStyles.reset),
		content: styles.content,
		title: styles.title,
		description: styles.description,
		success: styles.success,
		error: styles.error,
	},
} as const;

type PromiseToast<T> = typeof sonnerToast.promise<T>;

function toastPromise<T>(
	promise: Parameters<PromiseToast<T>>[0],
	options?: Parameters<PromiseToast<T>>[1],
): ReturnType<PromiseToast<T>> {
	return sonnerToast.promise(promise, {
		...defaultConfig,
		...options,
	});
}

type SuccessToast = typeof sonnerToast.success;

function toastSuccess(
	message: Parameters<SuccessToast>[0],
	options?: Parameters<SuccessToast>[1],
): ReturnType<SuccessToast> {
	return sonnerToast.success(message, {
		...defaultConfig,
		...options,
	});
}

export const toast = {
	...sonnerToast,
	promise: toastPromise,
	success: toastSuccess,
};

export function ToastActions({ className, children }: ComponentProps<"div">) {
	return <nav className={clsx(className, styles.actions)}>{children}</nav>;
}
