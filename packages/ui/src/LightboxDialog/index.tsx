"use client";

import { clsx } from "clsx";
import type { ComponentProps, RefObject } from "react";
import { Dialog } from "../Dialog";
import { Lightbox } from "../Lightbox";
import styles from "./styles.module.css";

type RootProps = Omit<ComponentProps<typeof Dialog>, "ref" | "children"> & {
	ref?: RefObject<HTMLDialogElement | null>;
	/**
	 * Defers mounting children until the dialog has opened at least once.
	 * Defaults to `isOpen` for callers that don't need to preserve children
	 * across close → open cycles.
	 */
	mounted?: boolean;
	children?: React.ReactNode;
	lightboxClassName?: string;
};

function LightboxDialogRoot({
	ref,
	isOpen = false,
	mounted = isOpen,
	children,
	className,
	lightboxClassName,
	...props
}: RootProps) {
	return (
		<Dialog
			ref={ref}
			isOpen={isOpen}
			className={clsx(styles.dialog, className)}
			{...props}
		>
			{mounted ? (
				<Lightbox className={clsx(styles.lightbox, lightboxClassName)}>
					{children}
				</Lightbox>
			) : null}
		</Dialog>
	);
}

function Header({ className, ...props }: ComponentProps<"header">) {
	return <header {...props} className={clsx(styles.header, className)} />;
}

function Footer({ className, ...props }: ComponentProps<"footer">) {
	return <footer {...props} className={clsx(styles.footer, className)} />;
}

export const LightboxDialog = Object.assign(LightboxDialogRoot, {
	Header,
	Footer,
});
