import { UnknownObject } from "src/core/utils/types";

export function toJson(object: unknown): UnknownObject {
	return JSON.parse(JSON.stringify(object));
}
