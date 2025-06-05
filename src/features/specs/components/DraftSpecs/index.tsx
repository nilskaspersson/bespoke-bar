"use client";

import { clsx } from "clsx";
import { type HTMLAttributes, useState } from "react";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import type { UserInputSpec } from "@/db/schema/specs";
import { SpecEntry } from "@/features/specs/components/SpecEntry";
import { userInputToSpec } from "@/features/specs/utils/userInputToSpec";
import { Button } from "@/ui/Button";
import { KEY_FIELD, type WithKey, withKey } from "@/utils/withKey";
import styles from "./styles.module.css";

export function DraftSpecs({
	className,
	createRecipe,
	...props
}: {
	createRecipe: (specs: UserInputSpec[]) => Promise<RecipeWithSpecs>;
} & HTMLAttributes<HTMLDivElement>) {
	const [specs, setSpecs] = useState<WithKey<UserInputSpec>[]>([]);

	const handleSubmit = (formData: FormData) => {
		const entry = formData.get("spec");

		if (entry) {
			const spec = userInputToSpec(entry.toString());

			if (!spec) return;

			setSpecs((prev) => [...prev, withKey(spec)]);
		}
	};

	const createChangeHandler =
		(spec: WithKey<UserInputSpec>) => (o: UserInputSpec) => {
			setSpecs((prev) =>
				prev.map((s) => (s[KEY_FIELD] === spec[KEY_FIELD] ? withKey(o) : s)),
			);
		};

	return (
		<div {...props} className={clsx(styles.container, className)}>
			{specs.length > 0 ? (
				<form action={() => void createRecipe(specs)}>
					<ul className={styles.box}>
						{specs.map((spec) => (
							<li key={spec[KEY_FIELD]}>
								<SpecEntry spec={spec} onChange={createChangeHandler(spec)} />
							</li>
						))}
					</ul>

					<Button type="submit">Save Recipe</Button>
				</form>
			) : null}

			<form action={handleSubmit} className={styles.form}>
				<input type="text" name="spec" className={styles.input} />
			</form>
		</div>
	);
}
