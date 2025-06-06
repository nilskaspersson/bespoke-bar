import { omit } from "@/utils";
import type { Identity } from "@/utils/types";

export type WithID<T> = T & { id: string };

export function hasID<T extends Record<PropertyKey, unknown>>(
	o: T,
): o is WithID<T> {
	return Object.hasOwn(o, "id");
}

export function withID<T extends Record<PropertyKey, unknown>>(
	o: T,
): Identity<WithID<T>> {
	return hasID(o) ? o : { ...o, id: crypto.randomUUID() };
}

export function withoutID<T extends Record<PropertyKey, unknown>>(
	o: T,
): Identity<Omit<T, "id">> {
	return omit(o, "id");
}
