"use client";

import { createContext, type ReactNode, useContext, useState } from "react";
import { createPortal } from "react-dom";
import { Flex } from "@/ui/Flex";
import { Grid } from "@/ui/Grid";
import styles from "./styles.module.css";

const SlotContext = createContext<HTMLDivElement | null>(null);

type HostProps = {
	children: ReactNode;
	left?: ReactNode;
};

export function BottomRailHost({ children, left }: HostProps) {
	const [slot, setSlot] = useState<HTMLDivElement | null>(null);

	return (
		<SlotContext.Provider value={slot}>
			{children}

			<Grid
				gap={2}
				alignItems="center"
				justifyContent="space-between"
				className={styles.rail}
			>
				<div className={styles.node}>{left}</div>

				<Flex
					className={styles.node}
					gap={2}
					wrap
					alignItems="center"
					justifyContent="center"
					ref={setSlot}
				/>

				<div className={styles.node} />
			</Grid>
		</SlotContext.Provider>
	);
}

type ItemsProps = { children: ReactNode };

export function BottomRailItems({ children }: ItemsProps) {
	const slot = useContext(SlotContext);
	if (!slot) return null;
	return createPortal(children, slot);
}
