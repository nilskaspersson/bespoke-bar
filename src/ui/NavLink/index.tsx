"use client";

import { clsx } from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Link> & {
	activeClassName?: string;
	exact?: boolean;
};

export function NavLink({
	href,
	exact,
	className,
	activeClassName,
	...props
}: Props) {
	const pathname = usePathname();

	const hrefString = typeof href === "string" ? href : (href.pathname ?? "");

	const isActive = exact
		? pathname === hrefString
		: pathname.startsWith(hrefString);

	return (
		<Link
			href={href}
			className={clsx(
				className,
				activeClassName
					? {
							[activeClassName]: isActive,
						}
					: undefined,
			)}
			{...props}
		/>
	);
}
