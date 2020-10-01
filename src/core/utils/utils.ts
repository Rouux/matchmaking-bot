export class Utils {
	/**
	 *
	 * @param args The array to remove elements from
	 * @param start The index to start at, inclusive
	 * @param end If supplied, the number of elements to remove
	 *
	 * If no 'end' is supplied, the function remove 1 element
	 */
	public static removeElementsFromArray<T extends unknown>(
		args: T[],
		start: number,
		count = 1
	): T[] {
		return [...args.slice(0, start), ...args.slice(start + 1 + count)];
	}
}
