import { flexRender, type Table } from "@tanstack/react-table";
import { clsx } from "clsx";
import type { ComponentProps } from "react";
import styles from "./styles.module.css";

export function TableBody<T>({
	getRowModel,
	className,
	...props
}: { getRowModel: Table<T>["getRowModel"] } & Omit<
	ComponentProps<"tbody">,
	"children"
>) {
	/**
	 * TanStack Table uses some strange re-rendering patterns behind the scenes that
	 * are incompatible with React Compiler.
	 * https://github.com/TanStack/table/issues/5567
	 */
	"use no memo";

	if (getRowModel().rows.length === 0) {
		return null;
	}

	return (
		<tbody className={className} {...props}>
			{getRowModel().rows.map((row) => (
				<tr key={row.id}>
					{row.getVisibleCells().map((cell) => (
						<td
							key={cell.id}
							className={clsx(styles.cell, styles.td)}
							width={cell.column.getSize()}
							data-label={cell.column.columnDef.header}
						>
							{flexRender(cell.column.columnDef.cell, cell.getContext())}
						</td>
					))}
				</tr>
			))}
		</tbody>
	);
}
