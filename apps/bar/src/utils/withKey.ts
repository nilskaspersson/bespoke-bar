import {
	type Identity,
	KEY_NAME,
	type Keyed,
	type WithId,
	type WithKey,
} from "@bespoke/schema/types";
import { omit } from "@/utils";

function hasKey<T extends Record<PropertyKey, unknown>>(o: T): o is WithKey<T> {
	return Object.hasOwn(o, KEY_NAME);
}

function hasId<T extends Record<PropertyKey, unknown>>(o: T): o is WithId<T> {
	return Object.hasOwn(o, "id") && typeof o.id === "string";
}

export function withKey<T extends Record<PropertyKey, unknown>>(
	o: T,
): WithKey<T> {
	return hasKey(o) ? o : { ...o, [KEY_NAME]: crypto.randomUUID() };
}

export function withoutKey<T extends Record<PropertyKey, unknown>>(
	o: T,
): Identity<Omit<T, typeof KEY_NAME>> {
	return omit(o, KEY_NAME);
}

/** @public */
export function isKeyed<T extends Record<PropertyKey, unknown>>(
	o: T,
): o is Keyed<T> {
	return hasKey(o) || hasId(o);
}

export function getKey<T extends Record<PropertyKey, unknown>>(
	o: Keyed<T>,
): string {
	return hasId(o) ? o.id : o[KEY_NAME];
}
