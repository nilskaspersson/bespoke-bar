"use client";

import { clsx } from "clsx";
import { type HTMLAttributes, useState } from "react";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import type { DraftSpec } from "@/db/schema/specs";
import { SpecEntry } from "@/features/specs/components/SpecEntry";
import { userInputToSpec } from "@/features/specs/utils/userInputToSpec";
import { Button } from "@/ui/Button";
import { type WithID, withID } from "@/utils/withId";
import styles from "./styles.module.css";

export function DraftSpecs({
	className,
	createRecipe,
	...props
}: {
	createRecipe: (specs: DraftSpec[]) => Promise<RecipeWithSpecs>;
} & HTMLAttributes<HTMLDivElement>) {
	const [specs, setSpecs] = useState<WithID<DraftSpec>[]>([]);

	const handleSubmit = (formData: FormData) => {
		const entry = formData.get("spec");

		if (entry) {
			const spec = userInputToSpec(entry.toString());

			if (!spec) return;

			setSpecs((prev) => [...prev, withID(spec)]);
		}
	};

	const createChangeHandler = (spec: WithID<DraftSpec>) => (o: DraftSpec) => {
		setSpecs((prev) => prev.map((s) => (s.id === spec.id ? withID(o) : s)));
	};

	return (
		<div {...props} className={clsx(styles.container, className)}>
			{specs.length > 0 ? (
				<form action={() => void createRecipe(specs)}>
					<ul className={styles.box}>
						{specs.map((spec) => (
							<li key={spec.id}>
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
