import _ from "lodash";
import { Colors } from "./constants";

export type Colors = keyof typeof Colors;

export type ColorResolvable =
	| keyof typeof Colors
	| string
	| number
	| [number, number, number];

export function resolveColor(color: Colors): number;

export function resolveColor<T extends ColorResolvable>(
	color: Exclude<T, Colors>
): number;

export function resolveColor(color: ColorResolvable): number {
	let result = NaN;
	if (typeof color === `string`) {
		result = Colors[<Colors>color] || parseInt(color.replace(`#`, ``), 16);
	} else if (Array.isArray(color)) {
		// eslint-disable-next-line no-bitwise
		result = (color[0] << 16) + (color[1] << 8) + color[2];
	}
	if (result && _.isNaN(result)) throw new TypeError(`COLOR_CONVERT`);
	else if (result < 0 || result > 0xffffff) throw new RangeError(`COLOR_RANGE`);

	return result;
}
