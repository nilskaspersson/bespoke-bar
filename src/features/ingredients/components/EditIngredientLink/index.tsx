"use client";

import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import type { Ingredient } from "@/db/schema/ingredients";
import { LinkButton } from "@/ui/Button";
import { Icon } from "@/ui/Icon";

export function EditIngredientLink({
	ingredient,
	children,
	...props
}: Omit<ComponentProps<typeof LinkButton>, "href"> & {
	ingredient: Pick<Partial<Ingredient>, "id">;
}) {
	const pathname = usePathname();
	const href = `/bar/ingredients/${ingredient.id}/edit?returnTo=${encodeURIComponent(pathname)}`;

	return (
		<LinkButton {...props} href={href} prefetch={false}>
			<Icon name="pen-to-square" size={1} />
			{children}
		</LinkButton>
	);
}
